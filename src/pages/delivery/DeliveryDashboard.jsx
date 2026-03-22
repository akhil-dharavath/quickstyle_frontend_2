import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchDeliveryOrders } from '../../redux/slices/orderSlice';
import { Package, MapPin, CheckCircle, Truck, ArrowRight } from 'lucide-react';

const DeliveryDashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { orders } = useSelector((state) => state.orders);

    useEffect(() => {
        dispatch(fetchDeliveryOrders());
    }, [dispatch]);

    const userId = user?._id || user?.id;

    // FIX: Use 'Confirmed' instead of 'Assigned' — 'Assigned' is not a valid Order status
    const myAssignedOrders = orders.filter(o => {
        const assignedId = o.assignedDeliveryPersonId?._id || o.assignedDeliveryPersonId;
        return assignedId === userId &&
            ['Confirmed', 'Picked Up', 'Out for Delivery'].includes(o.deliveryStatus || o.status);
    });

    const readyForPickup = orders.filter(o =>
        (o.deliveryStatus === 'Ready for Pickup' || o.deliveryStatus === 'Pending') &&
        !o.assignedDeliveryPersonId
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completed = orders.filter(o => {
        const assignedId = o.assignedDeliveryPersonId?._id || o.assignedDeliveryPersonId;
        const isDelivered = o.deliveryStatus === 'Delivered' || o.status === 'Delivered';
        const isToday = new Date(o.updatedAt || o.createdAt) >= today;
        return isDelivered && isToday && assignedId === userId;
    });

    const totalDeliveries = user?.deliveryProfile?.totalDeliveries || 0;
    const rating = user?.deliveryProfile?.rating;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Welcome back, {user?.name || 'Delivery Partner'}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Manage your pickups and deliveries
                    {rating ? ` · ⭐ ${Number(rating).toFixed(1)} Rating` : ''}
                    {totalDeliveries > 0 ? ` · ${totalDeliveries} total deliveries` : ''}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                            <Package className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Ready for Pickup</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{readyForPickup.length}</p>
                        </div>
                    </div>
                    <Link to="/delivery/pickups" className="mt-4 flex items-center gap-2 text-primary text-sm font-medium hover:underline">
                        View Pickups <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                            <MapPin className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Active Deliveries</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{myAssignedOrders.length}</p>
                        </div>
                    </div>
                    <Link to="/delivery/active" className="mt-4 flex items-center gap-2 text-primary text-sm font-medium hover:underline">
                        View Active <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Completed Today</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{completed.length}</p>
                        </div>
                    </div>
                    <Link to="/delivery/history" className="mt-4 flex items-center gap-2 text-primary text-sm font-medium hover:underline">
                        View History <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                    <Link to="/delivery/pickups"
                        className="flex items-center gap-3 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-gray-800 transition-colors">
                        <Package className="h-5 w-5" /> Pick Up Orders
                    </Link>
                    {myAssignedOrders.length > 0 && (
                        <Link to="/delivery/active"
                            className="flex items-center gap-3 px-6 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary transition-colors">
                            <Truck className="h-5 w-5" /> Continue Delivery
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeliveryDashboard;
