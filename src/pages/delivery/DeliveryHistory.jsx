import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDeliveryHistory } from '../../redux/slices/orderSlice';
import { CheckCircle, Package } from 'lucide-react';

const DeliveryHistory = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { deliveryHistory } = useSelector((state) => state.orders);

    useEffect(() => {
        // FIX: Use dedicated delivery history endpoint instead of filtering all delivery orders
        dispatch(fetchDeliveryHistory());
    }, [dispatch]);

    // FIX: deliveryHistory comes from the dedicated GET /api/delivery/history endpoint
    // which already filters by assignedDeliveryPersonId and deliveryStatus === 'Delivered'
    const completed = deliveryHistory || [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Delivery History</h1>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {completed.length} completed
                </span>
            </div>

            {completed.length === 0 ? (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-12 text-center">
                    <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No completed deliveries yet</p>
                    <p className="text-sm text-gray-400 mt-2">Your delivery history will appear here</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {completed.map((order) => (
                        <div key={order._id || order.id}
                            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                                    <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">
                                        Order #{(order._id || order.id)?.slice(-8).toUpperCase()}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {order.deliveryAddress?.address}, {order.deliveryAddress?.city}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {new Date(order.updatedAt || order.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric', month: 'short', year: 'numeric'
                                        })} · ₹{order.totalAmount || order.total}
                                    </p>
                                </div>
                            </div>
                            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                                Delivered
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DeliveryHistory;
