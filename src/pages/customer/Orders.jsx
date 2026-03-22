import { Helmet } from 'react-helmet-async';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Truck, CheckCircle, Clock, MapPin, X, RefreshCw } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, requestReplacementItem, cancelOrder } from '../../redux/slices/orderSlice';
import { toast } from 'react-toastify';
import MapTracking from './MapTracking';
import OrderSkeleton from '../../components/common/OrderSkeleton';

const Orders = () => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const { orders: allOrders, isLoading } = useSelector(state => state.orders);
    const [trackingOrder, setTrackingOrder] = useState(null);
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        dispatch(fetchOrders());
    }, [dispatch]);

    // Refresh countdown timer every 10 seconds for cancel button
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 10000);
        return () => clearInterval(timer);
    }, []);

    // FIX: Check deliveryStatus (not order.status which used to not exist on the model).
    // Also allow cancellation of 'Confirmed' orders (assigned but not yet preparing).
    const getCancelTimeLeft = (order) => {
        const cancellable = ['Pending', 'Confirmed'];
        if (!cancellable.includes(order.status)) return null;
        if (!order.createdAt) return null;
        const created = new Date(order.createdAt).getTime();
        const elapsed = (now - created) / 1000 / 60;
        const remaining = Math.max(0, 5 - elapsed);
        return remaining > 0 ? Math.ceil(remaining) : null;
    };

    const userId = user?._id || user?.id;

    // FIX: Removed dead mock order array (ORD-12345 etc.) entirely.
    // Real orders from the API are now the only source of truth.
    // FIX: getMyOrders is already scoped to req.user._id server-side.
    // The previous filter compared o.userId (an object) to userId (a string) — always false.
    // Keep only meaningful client-side filters (status, date range).
    const rawOrders = allOrders.filter(o =>
        o._id &&
        o._id // must have real backend _id
    );

    const normalizeOrder = (o) => ({
        _id: o._id,
        id: o._id,
        createdAt: o.createdAt,
        otp: o.otp,
        date: new Date(o.createdAt || Date.now()).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric'
        }),
        total: o.totalAmount || o.total || 0,
        // FIX: Prefer deliveryStatus as the display status (it's the actively updated field)
        status: o.deliveryStatus || o.status || 'Pending',
        deliveryAddress: o.deliveryAddress,
        assignedDeliveryPersonId: o.assignedDeliveryPersonId,
        items: (o.items || []).map(i => ({
            _id: i._id,
            productId: i.productId?._id || i.productId,
            name: i.name || i.productId?.name || 'Product',
            quantity: i.quantity || 1,
            image: i.image || i.productId?.images?.[0] ||
                'https://images.unsplash.com/photo-1523381210434-271e8be1f52b',
            replacementCount: i.replacementCount || 0,
            replacementStatus: i.replacementStatus || 'None'
        }))
    });

    const displayOrders = rawOrders.map(normalizeOrder);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered':
                return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
            case 'Processing': case 'Preparing':
                return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
            case 'Ready for Pickup':
                return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
            case 'On the way': case 'Picked Up': case 'Out for Delivery': case 'Confirmed':
                return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
            case 'Cancelled':
                return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Delivered': return <CheckCircle className="h-4 w-4" />;
            case 'Processing': case 'Preparing': return <Clock className="h-4 w-4" />;
            case 'Ready for Pickup': return <Package className="h-4 w-4" />;
            case 'On the way': case 'Picked Up': case 'Out for Delivery': case 'Confirmed':
                return <Truck className="h-4 w-4" />;
            default: return <Package className="h-4 w-4" />;
        }
    };

    const isTrackable = (status) =>
        ['Confirmed', 'Ready for Pickup', 'Picked Up', 'On the way',
         'Out for Delivery', 'Processing'].includes(status);

    // OTP should show for these statuses
    const showOtp = (status) =>
        ['Confirmed', 'Ready for Pickup', 'Picked Up', 'On the way', 'Out for Delivery'].includes(status);

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
            <Helmet>
                <title>My Orders | QuickStyle</title>
            </Helmet>
            <h1 className="text-3xl font-heading font-bold mb-2 text-gray-900 dark:text-white">Order History</h1>
            <p className="text-gray-500 mb-8">Track and manage your recent purchases.</p>

            <div className="space-y-4">
                {isLoading ? (
                    <>
                        <OrderSkeleton />
                        <OrderSkeleton />
                        <OrderSkeleton />
                    </>
                ) : displayOrders.length === 0 ? (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-12 text-center">
                        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-900 dark:text-white">No orders yet</p>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Your order history will appear here</p>
                    </div>
                ) : displayOrders.map((order, i) => (
                    <motion.div
                        key={order._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(i * 0.05, 0.3) }}
                        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                    >
                        {/* Order Header */}
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-4 justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                            <div className="flex gap-4 md:gap-6 text-sm">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1 font-medium">Order ID</p>
                                    <p className="font-bold font-mono text-gray-900 dark:text-white text-xs">
                                        #{order._id?.slice(-8).toUpperCase()}
                                    </p>
                                </div>
                                <div className="hidden md:block">
                                    <p className="text-xs text-gray-500 mb-1 font-medium">Date Placed</p>
                                    <p className="font-bold text-gray-900 dark:text-white">{order.date}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1 font-medium">Total</p>
                                    <p className="font-bold text-gray-900 dark:text-white">₹{order.total}</p>
                                </div>
                            </div>
                            <div className={`px-2.5 py-1 rounded-full text-[10px] md:text-xs font-bold border flex items-center gap-1.5 uppercase tracking-wide ${getStatusColor(order.status)}`}>
                                {getStatusIcon(order.status)}
                                {order.status}
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="p-4">
                            <div className="space-y-3 mb-4">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4 justify-between border-b border-gray-50 dark:border-gray-800 last:border-0 pb-3 last:pb-0">
                                        <div className="flex items-center gap-4">
                                            <div className="h-16 w-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        e.target.src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200';
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-white font-heading text-sm">{item.name}</h4>
                                                <p className="text-xs text-gray-500 mb-1">Qty: {item.quantity}</p>
                                                {item.replacementCount > 0 && (
                                                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                                        Replacements: {item.replacementCount}/2
                                                    </span>
                                                )}
                                                {item.replacementStatus === 'Requested' && (
                                                    <span className="text-[10px] ml-2 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                                                        Replacement Requested
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Replace button — only for delivered orders */}
                                        {order.status === 'Delivered' &&
                                         item.replacementCount < 2 &&
                                         item.replacementStatus !== 'Requested' && (
                                            <button
                                                onClick={() => {
                                                    if (window.confirm(
                                                        'Request a replacement for this item? Max 2 per item. No refunds.'
                                                    )) {
                                                        dispatch(requestReplacementItem({
                                                            orderId: order._id,
                                                            itemId: item._id || item.productId
                                                        }));
                                                    }
                                                }}
                                                className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                                            >
                                                <RefreshCw className="h-3 w-3" />
                                                Replace
                                            </button>
                                        )}
                                        {order.status === 'Delivered' && item.replacementCount >= 2 && (
                                            <span className="text-xs text-gray-400 italic">Max Replacements Reached</span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Footer Actions */}
                            <div className="flex flex-wrap justify-between items-center gap-3 mt-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                                {/* OTP display — FIX: now shows for all active delivery statuses */}
                                <div>
                                    {showOtp(order.status) && order.otp && (
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                                                Share OTP with Delivery Partner
                                            </span>
                                            <span className="text-2xl font-black font-mono text-primary tracking-widest">
                                                {order.otp}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2 flex-wrap">
                                    {/* Track Order button */}
                                    {isTrackable(order.status) && (
                                        <button
                                            onClick={() => {
                                                // FIX: pass the full raw order so MapTracking gets orderId
                                                const raw = rawOrders.find(r => r._id === order._id) || order;
                                                setTrackingOrder(raw);
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
                                        >
                                            <MapPin className="h-4 w-4" />
                                            Track Order
                                        </button>
                                    )}

                                    {/* Cancel button */}
                                    {(() => {
                                        const minsLeft = getCancelTimeLeft(order);
                                        if (!minsLeft) return null;
                                        return (
                                            <button
                                                onClick={async () => {
                                                    if (!window.confirm('Are you sure you want to cancel this order?')) return;
                                                    try {
                                                        await dispatch(cancelOrder(order._id)).unwrap();
                                                        toast.success('Order cancelled successfully');
                                                    } catch (err) {
                                                        toast.error(err || 'Failed to cancel order');
                                                    }
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                                Cancel ({minsLeft}m left)
                                            </button>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Map Tracking Modal */}
            <AnimatePresence>
                {trackingOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setTrackingOrder(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl relative"
                        >
                            <button
                                onClick={() => setTrackingOrder(null)}
                                className="absolute top-4 right-4 z-10 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-900 dark:text-white" />
                            </button>

                            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                                <h2 className="text-xl font-bold font-heading text-gray-900 dark:text-white">
                                    Tracking Order #{trackingOrder._id?.slice(-8).toUpperCase()}
                                </h2>
                                <p className="text-gray-500 text-sm">Live updates from our delivery partner</p>
                            </div>

                            <div className="h-[60vh] md:h-[500px] w-full relative">
                                <MapTracking
                                    status={trackingOrder.deliveryStatus || trackingOrder.status}
                                    orderId={trackingOrder._id}
                                    source={[17.4401, 78.3489]}
                                    destination={
                                        trackingOrder.deliveryAddress?.lat && trackingOrder.deliveryAddress?.lng
                                            ? [trackingOrder.deliveryAddress.lat, trackingOrder.deliveryAddress.lng]
                                            : [17.4486, 78.3908]
                                    }
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Orders;
