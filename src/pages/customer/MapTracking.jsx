import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Phone, MessageSquare, Clock } from 'lucide-react';
import apiService from '../../services/api';

// Fix for default Leaflet marker icons in Vite/React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const riderIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2830/2830305.png',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
});

const homeIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/25/25694.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
});

const warehouseIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1008/1008010.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
});

// FIX: Added useRef import (was missing). Tracking modal crashed silently.
const MapTracking = ({ status, source = [17.4622, 78.3568], destination, orderId }) => {
    const warehousePos = source;
    const customerPos = destination || [17.4435, 78.3772];

    const [riderPos, setRiderPos] = useState(warehousePos);
    const [progress, setProgress] = useState(0);
    const [deliveryPartner, setDeliveryPartner] = useState(null);

    // FIX: Use a single ref to hold all active intervals/timeouts for clean cleanup
    const timerRef = useRef(null);
    const pollingRef = useRef(null);

    useEffect(() => {
        // Always clear any existing timers when effect re-runs
        clearInterval(timerRef.current);
        clearInterval(pollingRef.current);

        if (status === 'Delivered') {
            setRiderPos(customerPos);
            return;
        }

        if (status === 'Pending' || status === 'Confirmed') {
            setRiderPos(warehousePos);
            return;
        }

        if (orderId) {
            // FIX: Real polling — fetch actual GPS coordinates from the backend
            const fetchLiveLocation = async () => {
                try {
                    const response = await apiService.getOrder(orderId);
                    const order = response.data;

                    // MongoDB GeoJSON stores coordinates as [lng, lat]
                    const coords = order.assignedDeliveryPersonId
                        ?.deliveryProfile?.currentLocation?.coordinates;
                    if (coords && coords.length === 2) {
                        setRiderPos([coords[1], coords[0]]); // [lat, lng] for Leaflet
                    }

                    if (order.assignedDeliveryPersonId &&
                        typeof order.assignedDeliveryPersonId === 'object') {
                        setDeliveryPartner(order.assignedDeliveryPersonId);
                    }
                } catch (err) {
                    console.error('Live tracking fetch failed:', err.message);
                }
            };

            fetchLiveLocation(); // immediate
            pollingRef.current = setInterval(fetchLiveLocation, 8000);

            return () => clearInterval(pollingRef.current);
        }

        // Demo animation fallback when no real orderId is provided
        if (!orderId && status === 'On the way') {
            timerRef.current = setInterval(() => {
                setProgress(prev => {
                    const next = prev + 0.005;
                    if (next >= 1) {
                        clearInterval(timerRef.current);
                        return 1;
                    }
                    const lat = warehousePos[0] + (customerPos[0] - warehousePos[0]) * next;
                    const lng = warehousePos[1] + (customerPos[1] - warehousePos[1]) * next;
                    setRiderPos([lat, lng]);
                    return next;
                });
            }, 100);

            return () => clearInterval(timerRef.current);
        }
    // FIX: Stable dependency values prevent infinite re-render loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId, status]);

    return (
        <div className="relative h-full w-full bg-gray-100 dark:bg-gray-800">
            <MapContainer
                center={[
                    (warehousePos[0] + customerPos[0]) / 2,
                    (warehousePos[1] + customerPos[1]) / 2
                ]}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                <Marker position={warehousePos} icon={warehouseIcon}>
                    <Popup>Seller / Pickup Location</Popup>
                </Marker>

                <Marker position={customerPos} icon={homeIcon}>
                    <Popup>Your Delivery Address</Popup>
                </Marker>

                <Marker position={riderPos} icon={riderIcon}>
                    <Popup>
                        <div className="text-center">
                            <p className="font-bold">{deliveryPartner?.name || 'Delivery Partner'}</p>
                            <p className="text-xs text-gray-500">{status}</p>
                        </div>
                    </Popup>
                </Marker>

                <Polyline
                    positions={[warehousePos, customerPos]}
                    color="#6366f1"
                    weight={4}
                    opacity={0.6}
                    dashArray="8 6"
                />
            </MapContainer>

            {/* Top status bar */}
            <div className="absolute top-4 left-4 right-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md px-4 py-3 rounded-xl shadow-lg z-[1000] border border-gray-200 dark:border-gray-600 flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                    <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {status === 'Delivered' ? 'Delivered!' :
                         status === 'Pending' ? 'Waiting for confirmation' :
                         status === 'Confirmed' || status === 'Ready for Pickup' ? 'Preparing your order' :
                         'On the way to you'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {status === 'Delivered' ? 'Enjoy your order!' : 'Estimated 15-45 mins'}
                    </p>
                </div>
            </div>

            {/* Delivery Partner card */}
            <div className="absolute bottom-4 left-4 right-4 bg-white dark:bg-gray-900 rounded-xl shadow-2xl z-[1000] overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="bg-primary/5 dark:bg-primary/10 p-4 flex items-center gap-4">
                    <div className="relative">
                        <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(deliveryPartner?.name || 'Partner')}&background=6366f1&color=fff`}
                            alt="Delivery Partner"
                            className="w-14 h-14 rounded-full border-2 border-white dark:border-gray-800 object-cover"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-gray-800">
                            {deliveryPartner?.deliveryProfile?.rating
                                ? `${Number(deliveryPartner.deliveryProfile.rating).toFixed(1)}★`
                                : '4.8★'}
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-white">
                            {deliveryPartner?.name || 'Delivery Partner'}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Delivery Partner</p>
                        <div className="flex gap-2 mt-2">
                            <a
                                href={`tel:${deliveryPartner?.contactNumber || ''}`}
                                className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                <Phone className="h-3 w-3" /> Call
                            </a>
                            <button className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                <MessageSquare className="h-3 w-3" /> Message
                            </button>
                        </div>
                    </div>
                </div>

                {/* Progress bar for demo animation */}
                {!orderId && status === 'On the way' && progress > 0 && (
                    <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                            <span>Arriving</span>
                            <span>{Math.max(1, Math.round((1 - progress) * 15))} mins</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                            <div
                                className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${progress * 100}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MapTracking;
