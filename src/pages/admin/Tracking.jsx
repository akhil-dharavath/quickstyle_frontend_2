import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActiveDeliveries } from '../../redux/slices/orderSlice';
import { Map } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const riderIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2830/2830305.png',
    iconSize: [36, 36], iconAnchor: [18, 18], popupAnchor: [0, -18],
});

const Tracking = () => {
    const dispatch = useDispatch();
    const { activeDeliveries } = useSelector((state) => state.orders);

    useEffect(() => {
        dispatch(fetchActiveDeliveries());
        const interval = setInterval(() => dispatch(fetchActiveDeliveries()), 8000);
        return () => clearInterval(interval);
    }, [dispatch]);

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col">
            <div className="mb-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Map className="text-primary" /> Live Delivery Tracking
                </h2>
                <div className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                    <span className="text-gray-600 dark:text-gray-400">{activeDeliveries.length} Active</span>
                </div>
            </div>

            <div className="flex-1 rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700 relative z-0">
                <MapContainer center={[17.4528, 78.3670]} zoom={12} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />
                    {activeDeliveries.map((delivery) => {
                        // FIX: GeoJSON stores coordinates as [lng, lat] — must swap for Leaflet
                        const coords = delivery.assignedDeliveryPersonId?.deliveryProfile?.currentLocation?.coordinates;
                        const lat = coords?.[1] ?? 17.4528;
                        const lng = coords?.[0] ?? 78.3670;
                        return (
                            <Marker key={delivery._id || delivery.id} position={[lat, lng]} icon={riderIcon}>
                                <Popup>
                                    <div className="p-2 min-w-[160px]">
                                        <p className="font-bold text-sm mb-1">Order #{(delivery._id || delivery.id)?.slice(-6).toUpperCase()}</p>
                                        <p className="text-xs text-gray-600 mb-1">{delivery.assignedDeliveryPersonId?.name || 'Unknown Rider'}</p>
                                        {delivery.deliveryAddress?.address && (
                                            <p className="text-xs text-gray-500">→ {delivery.deliveryAddress.address}, {delivery.deliveryAddress.city}</p>
                                        )}
                                        <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${delivery.deliveryStatus === 'Delivered' ? 'bg-green-100 text-green-700' : delivery.deliveryStatus === 'Picked Up' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {delivery.deliveryStatus}
                                        </span>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
                {activeDeliveries.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg text-center">
                            <p className="text-gray-500 dark:text-gray-400 font-medium">No active deliveries right now</p>
                            <p className="text-xs text-gray-400 mt-1">Map updates every 8 seconds</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Tracking;
