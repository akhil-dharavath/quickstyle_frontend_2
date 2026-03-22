import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDeliveryOrders, updateOrderDeliveryStatus, assignDeliveryPersonToOrder } from '../../redux/slices/orderSlice';
import { assignOrderToDelivery } from '../../redux/slices/deliverySlice';
import { Package, MapPin, Phone, ChevronRight } from 'lucide-react';
import apiService from '../../services/api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const DeliveryPickups = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { orders } = useSelector((state) => state.orders);
    const [acceptingId, setAcceptingId] = useState(null);

    useEffect(() => {
        dispatch(fetchDeliveryOrders());
    }, [dispatch]);

    const userId = user?._id || user?.id;

    // Orders ready to be claimed — unassigned, Ready for Pickup or Pending
    const readyForPickup = orders.filter(o =>
        (o.status === 'Ready for Pickup' || o.deliveryStatus === 'Ready for Pickup' || o.status === 'Pending' || o.deliveryStatus === 'Pending') &&
        !o.assignedDeliveryPersonId
    );

    // Orders already assigned to me but not yet delivered
    const myPickups = orders.filter(o => {
        const assignedId = o.assignedDeliveryPersonId?._id || o.assignedDeliveryPersonId;
        return assignedId === userId && (o.deliveryStatus || o.status) !== 'Delivered';
    });

    const handleAcceptPickup = async (order) => {
        setAcceptingId(order._id || order.id);
        try {
            // FIX: Use the dedicated claim endpoint (atomic, prevents race conditions)
            // Previously used updateOrderDeliveryStatus which had no server-side claim logic
            await apiService.claimDeliveryOrder(order._id || order.id);

            // Update local Redux state to reflect assignment
            dispatch(assignDeliveryPersonToOrder({ orderId: order._id || order.id, deliveryPersonId: userId }));
            dispatch(assignOrderToDelivery({ deliveryPersonId: userId, orderId: order._id || order.id }));
            // Refresh orders list
            dispatch(fetchDeliveryOrders());

            toast.success('Order claimed! Head to the seller to pick up the package.');
        } catch (error) {
            const msg = error?.response?.data?.message || error?.message || 'Failed to claim order';
            toast.error(msg);
        } finally {
            setAcceptingId(null);
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pickup Orders</h1>

            {myPickups.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">My Assigned Pickups</h2>
                    <div className="space-y-4">
                        {myPickups.map((order) => (
                            <div key={order._id || order.id}
                                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <p className="font-bold text-gray-900 dark:text-white">
                                            Order #{(order._id || order.id)?.slice(-8).toUpperCase()}
                                        </p>
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                            {order.deliveryStatus || order.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {order.items?.length || 0} items · ₹{order.totalAmount || order.total}
                                    </p>
                                    {order.deliveryAddress && (
                                        <div className="mt-3 flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                            <span>{order.deliveryAddress.address}, {order.deliveryAddress.city}</span>
                                        </div>
                                    )}
                                </div>
                                <Link to="/delivery/active"
                                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-gray-800 transition-colors">
                                    Start Delivery <ChevronRight className="h-5 w-5" />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Available for Pickup</h2>
                {readyForPickup.length === 0 ? (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-12 text-center">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No orders ready for pickup at the moment</p>
                        <p className="text-sm text-gray-400 mt-2">Check back soon for new assignments</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {readyForPickup.map((order) => (
                            <div key={order._id || order.id}
                                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <p className="font-bold text-gray-900 dark:text-white">
                                        Order #{(order._id || order.id)?.slice(-8).toUpperCase()}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {order.items?.length || 0} items · ₹{order.totalAmount || order.total}
                                    </p>
                                    {order.shopId?.name && (
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                            📦 Pickup from: {order.shopId.name}
                                        </p>
                                    )}
                                    {order.deliveryAddress && (
                                        <div className="mt-2 flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                            <span>{order.deliveryAddress.address}, {order.deliveryAddress.city} — {order.deliveryAddress.pincode}</span>
                                        </div>
                                    )}
                                    {order.deliveryAddress?.phone && (
                                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                                            <Phone className="h-4 w-4" />
                                            {order.deliveryAddress.phone}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleAcceptPickup(order)}
                                    disabled={acceptingId === (order._id || order.id)}
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50">
                                    {acceptingId === (order._id || order.id) ? 'Accepting...' : 'Accept Pickup'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliveryPickups;
