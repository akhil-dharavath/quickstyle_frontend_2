import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateOrderDeliveryStatus, verifyDeliveryOTP } from '../../redux/slices/orderSlice';
import { clearDeliveryAssignment } from '../../redux/slices/deliverySlice';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Marker } from '@react-google-maps/api';
import { MapPin, Navigation, CheckCircle, Truck, Loader2, Camera, ShieldCheck, Phone } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import useDeliveryLocationUpdater from '../../hooks/useDeliveryLocationUpdater';
import { fetchDeliveryOrders } from '../../redux/slices/orderSlice';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const containerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 17.4486, lng: 78.3908 };

const DeliveryActive = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { orders } = useSelector((state) => state.orders);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: GOOGLE_MAPS_API_KEY
    });
    const [map, setMap] = useState(null);
    const [directionsResponse, setDirectionsResponse] = useState(null);
    const [activeOrder, setActiveOrder] = useState(null);
    const [locationEnabled, setLocationEnabled] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [watchId, setWatchId] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [otpInput, setOtpInput] = useState(['', '', '', '']);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        dispatch(fetchDeliveryOrders());
    }, [dispatch]);

    useEffect(() => {
        // FIX: 'Assigned' is not a valid Order status enum value — use 'Confirmed'
        // A delivery partner's active order is Confirmed (assigned to them) or Picked Up
        const foundOrder = orders.find((o) =>
            ['Confirmed', 'Picked Up', 'Out for Delivery'].includes(o.deliveryStatus) &&
            (o.assignedDeliveryPersonId === (user?._id || user?.id) ||
             o.assignedDeliveryPersonId?._id === (user?._id || user?.id))
        );
        setActiveOrder(foundOrder);
    }, [orders, user]);

    useDeliveryLocationUpdater(locationEnabled && !!activeOrder);

    useEffect(() => {
        return () => { if (watchId) navigator.geolocation.clearWatch(watchId); };
    }, [watchId]);

    const calculateRoute = useCallback(async (origin, destination) => {
        if (!window.google) return;
        const directionsService = new window.google.maps.DirectionsService();
        try {
            const result = await directionsService.route({
                origin,
                destination,
                travelMode: window.google.maps.TravelMode.DRIVING,
            });
            setDirectionsResponse(result);
        } catch (error) {
            console.error('Error calculating route:', error);
        }
    }, []);

    useEffect(() => {
        if (isLoaded && activeOrder && userLocation) {
            let destination = defaultCenter;
            // FIX: Use 'Confirmed' instead of 'Assigned' — heading to seller shop
            if (activeOrder.deliveryStatus === 'Confirmed') {
                const shopLoc = activeOrder.shopId?.location;
                if (shopLoc?.coordinates) {
                    // GeoJSON: [lng, lat]
                    destination = { lat: shopLoc.coordinates[1], lng: shopLoc.coordinates[0] };
                } else {
                    destination = { lat: 17.4500, lng: 78.3800 };
                }
            } else if (activeOrder.deliveryStatus === 'Picked Up') {
                if (activeOrder.deliveryAddress?.lat && activeOrder.deliveryAddress?.lng) {
                    destination = { lat: activeOrder.deliveryAddress.lat, lng: activeOrder.deliveryAddress.lng };
                }
            }
            calculateRoute(userLocation, destination);
        }
    }, [isLoaded, activeOrder, userLocation, calculateRoute]);

    const handleTurnOnLocation = () => {
        if (!navigator.geolocation) { toast.error('Geolocation is not supported'); return; }
        setLocationEnabled(true);
        const id = navigator.geolocation.watchPosition(
            (pos) => {
                const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setUserLocation(newPos);
            },
            (err) => { toast.error('Could not get location: ' + err.message); setLocationEnabled(false); },
            { enableHighAccuracy: true }
        );
        setWatchId(id);
        toast.success('Location tracking is now ON');
    };

    const handleTurnOffLocation = () => {
        if (watchId) { navigator.geolocation.clearWatch(watchId); setWatchId(null); }
        setLocationEnabled(false);
        toast.info('Location tracking turned off');
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { toast.error('Please select a valid image file'); return; }
        if (file.size > 10 * 1024 * 1024) { toast.error('Image must be under 10MB'); return; }

        setIsUploading(true);
        try {
            const response = await apiService.uploadImage(file);
            const photoUrl = response.data.url;
            // FIX: Check 'Confirmed' not 'Assigned'
            const isPickup = activeOrder.deliveryStatus === 'Confirmed';

            if (isPickup) {
                await dispatch(updateOrderDeliveryStatus({
                    orderId: activeOrder._id || activeOrder.id,
                    deliveryStatus: 'Picked Up'
                })).unwrap();
                toast.info("Marked as Picked Up. Head to the customer's location.");
            } else {
                setShowOtpModal(true);
            }
        } catch (err) {
            toast.error(err?.message || 'Photo upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (!/^\d?$/.test(value)) return;
        const newOtp = [...otpInput];
        newOtp[index] = value;
        setOtpInput(newOtp);
        if (value && index < 3) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const verifyOtp = async () => {
        const enteredOtp = otpInput.join('');
        if (enteredOtp.length < 4) { toast.error('Please enter the 4-digit OTP'); return; }
        setIsVerifying(true);
        try {
            await dispatch(verifyDeliveryOTP({
                orderId: activeOrder._id || activeOrder.id,
                otp: enteredOtp
            })).unwrap();
            dispatch(clearDeliveryAssignment(user?._id || user?.id));
            setShowOtpModal(false);
            toast.success('Delivery Verified & Completed! Great job.');
            navigate('/delivery');
        } catch (error) {
            toast.error(typeof error === 'string' ? error : 'Invalid OTP. Please ask the customer for the correct code.');
            setOtpInput(['', '', '', '']);
        } finally {
            setIsVerifying(false);
        }
    };

    if (!activeOrder) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Active Delivery</h1>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-12 text-center">
                    <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 dark:text-white">No active delivery</p>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Accept a pickup from the Pickups page to start a delivery</p>
                </div>
            </div>
        );
    }

    // FIX: isPickupPhase is now 'Confirmed' (assigned, heading to seller), not 'Assigned'
    const isPickupPhase = activeOrder.deliveryStatus === 'Confirmed';

    return (
        <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {isPickupPhase ? 'Heading to Seller' : 'Heading to Customer'}
                    </h1>
                    <p className="text-sm text-gray-500">Order #{(activeOrder._id || activeOrder.id)?.slice(-8).toUpperCase()}</p>
                </div>
                <div className="flex gap-3">
                    {!locationEnabled ? (
                        <button onClick={handleTurnOnLocation}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
                            <Navigation className="h-5 w-5" /> Start Navigation
                        </button>
                    ) : (
                        <button onClick={handleTurnOffLocation}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700">
                            <MapPin className="h-5 w-5" /> Stop Tracking
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden relative shadow-sm">
                {!isLoaded ? (
                    <div className="flex flex-col items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                        <p className="text-gray-500">Loading Google Maps...</p>
                        {!GOOGLE_MAPS_API_KEY && <p className="text-xs text-red-500 mt-2">No API Key Found</p>}
                    </div>
                ) : (
                    <GoogleMap mapContainerStyle={containerStyle} center={userLocation || defaultCenter} zoom={15}
                        onLoad={m => setMap(m)} options={{ disableDefaultUI: true, zoomControl: true }}>
                        {userLocation && <Marker position={userLocation} icon={{ url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png' }} />}
                        {directionsResponse && <DirectionsRenderer directions={directionsResponse} />}
                    </GoogleMap>
                )}

                <div className="absolute bottom-4 left-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                                {isPickupPhase ? 'PICKUP LOCATION' : 'DELIVERY LOCATION'}
                            </p>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-primary" />
                                <span className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">
                                    {isPickupPhase
                                        ? (activeOrder.shopId ? `${activeOrder.shopId.name || 'Seller'}, ${activeOrder.shopId.address?.city || ''}` : 'Seller Location')
                                        : `${activeOrder.deliveryAddress?.address || ''}, ${activeOrder.deliveryAddress?.city || ''}`}
                                </span>
                            </div>
                        </div>
                        {activeOrder.deliveryAddress?.phone && !isPickupPhase && (
                            <a href={`tel:${activeOrder.deliveryAddress.phone}`}
                                className="flex items-center gap-1 text-primary hover:underline text-sm font-bold">
                                <Phone className="h-3 w-3" /> Call Customer
                            </a>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <input type="file" accept="image/*" capture="environment" className="hidden"
                            ref={fileInputRef} onChange={handleFileUpload} />

                        {isPickupPhase ? (
                            <button onClick={() => fileInputRef.current?.click()} disabled={isUploading}
                                className="flex-1 flex items-center justify-center gap-2 bg-black text-white dark:bg-white dark:text-black py-3 rounded-lg font-bold hover:opacity-90">
                                {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                                {isUploading ? 'Uploading...' : 'Confirm Pickup (Photo)'}
                            </button>
                        ) : (
                            <div className="flex-1 flex gap-3">
                                <button onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading || !!activeOrder.deliveryPhoto}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold border transition-all ${activeOrder.deliveryPhoto ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-black border-gray-200 hover:bg-gray-50'}`}>
                                    {activeOrder.deliveryPhoto ? <CheckCircle className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
                                    {activeOrder.deliveryPhoto ? 'Photo Taken' : '1. Take Photo'}
                                </button>
                                <button onClick={() => setShowOtpModal(true)}
                                    className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg font-bold hover:opacity-90">
                                    <ShieldCheck className="h-5 w-5" /> 2. Verify OTP
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showOtpModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl w-full max-w-sm">
                        <h2 className="text-xl font-bold text-center mb-2 font-heading">Verify Delivery</h2>
                        <p className="text-gray-500 text-center text-sm mb-6">Ask the customer for the 4-digit code shown in their app.</p>
                        <div className="flex justify-center gap-3 mb-6">
                            {otpInput.map((digit, idx) => (
                                <input key={idx} id={`otp-${idx}`} type="text" maxLength="1" value={digit}
                                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Backspace' && !digit && idx > 0) document.getElementById(`otp-${idx - 1}`)?.focus(); }}
                                    className="w-12 h-14 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-center text-2xl font-bold bg-transparent focus:border-primary focus:outline-none transition-colors" />
                            ))}
                        </div>
                        <div className="space-y-3">
                            <button onClick={verifyOtp} disabled={otpInput.some(d => !d) || isVerifying}
                                className="w-full py-3 bg-primary text-white rounded-lg font-bold hover:brightness-110 disabled:opacity-50">
                                {isVerifying ? 'Verifying...' : 'Complete Delivery'}
                            </button>
                            <button onClick={() => setShowOtpModal(false)}
                                className="w-full py-3 text-gray-500 font-medium hover:text-gray-900 dark:hover:text-white">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliveryActive;
