import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchShopOrders, updateOrderStatusBySeller } from '../../redux/slices/orderSlice';
import { Package, X, Eye, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import Pagination from '../../components/common/Pagination';

const SellerOrders = () => {
    const dispatch = useDispatch();
    const { orders, isLoading } = useSelector(state => state.orders);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [markingId, setMarkingId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        dispatch(fetchShopOrders());
    }, [dispatch]);

    const myOrders = orders || [];
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrders = myOrders.slice(indexOfFirstItem, indexOfLastItem);

    // FIX: handleMarkReady now calls the real API endpoint (PUT /orders/:id/status)
    // instead of the old updateOrderStatus which was a local-only Redux action.
    const handleMarkReady = async (orderId) => {
        setMarkingId(orderId);
        try {
            await dispatch(updateOrderStatusBySeller({
                orderId,
                status: 'Ready for Pickup'
            })).unwrap();
            toast.success('Order marked as Ready for Pickup! Delivery partner will be notified.');
        } catch (err) {
            toast.error(err || 'Failed to update order status');
        } finally {
            setMarkingId(null);
        }
    };

    const getStatusBadge = (status) => {
        const map = {
            'Delivered':         'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            'Cancelled':         'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
            'Pending':           'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
            'Ready for Pickup':  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            'Picked Up':         'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
            'Preparing':         'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
        };
        return map[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Incoming Orders</h2>
                {myOrders.length > 0 && (
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-medium dark:text-white">
                        Total: {myOrders.length}
                    </span>
                )}
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="text-center py-12 text-gray-500">Loading orders...</div>
                ) : myOrders.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">No orders yet.</div>
                ) : (
                    <>
                        {currentOrders.map(order => {
                            const displayStatus = order.deliveryStatus || order.status || 'Pending';
                            const canMarkReady = displayStatus === 'Pending' || displayStatus === 'Confirmed';
                            const alreadyMarked = displayStatus === 'Ready for Pickup';

                            return (
                                <div key={order._id || order.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between gap-6">
                                    <div className="space-y-3 flex-1">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <h3 className="text-base font-bold text-gray-900 dark:text-white font-mono">
                                                #{(order._id || order.id)?.slice(-8).toUpperCase()}
                                            </h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(displayStatus)}`}>
                                                {displayStatus}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Placed: {new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
                                                day: 'numeric', month: 'short', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>

                                        {/* FIX: Show product images and names from populated items.productId */}
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {order.items.map((item, idx) => {
                                                const productName = item.name || item.productId?.name || 'Product';
                                                const productImg = item.image || item.productId?.images?.[0];
                                                return (
                                                    <div key={idx} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-3 py-1.5 rounded-lg border dark:border-gray-600">
                                                        {productImg && (
                                                            <img
                                                                src={productImg}
                                                                alt={productName}
                                                                className="h-8 w-8 rounded object-cover flex-shrink-0"
                                                            />
                                                        )}
                                                        <div>
                                                            <p className="text-xs font-medium dark:text-gray-200 max-w-[120px] truncate">{productName}</p>
                                                            <p className="text-[10px] text-gray-500">Qty: {item.quantity}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-between items-end gap-4 min-w-[140px]">
                                        {/* FIX: Use totalAmount (API field) not total */}
                                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                                            ₹{order.totalAmount || order.total || 0}
                                        </span>

                                        <div className="flex flex-col gap-2 w-full">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200 flex items-center justify-center gap-2"
                                            >
                                                <Eye className="h-4 w-4" />
                                                View Details
                                            </button>

                                            {alreadyMarked ? (
                                                <div className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium">
                                                    <CheckCircle className="h-4 w-4" />
                                                    Ready for Pickup
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleMarkReady(order._id || order.id)}
                                                    disabled={!canMarkReady || markingId === (order._id || order.id)}
                                                    className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                >
                                                    {markingId === (order._id || order.id) ? (
                                                        <span>Updating...</span>
                                                    ) : (
                                                        <>
                                                            <Package className="h-4 w-4" />
                                                            Mark Ready
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        <Pagination
                            currentPage={currentPage}
                            totalItems={myOrders.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}
            </div>

            {/* Order Detail Modal - FIX: shows real customer and address data */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                Order #{(selectedOrder._id || selectedOrder.id)?.slice(-8).toUpperCase()}
                            </h3>
                            <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wide mb-1">Customer</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {selectedOrder.userId?.name || selectedOrder.customerName || 'N/A'}
                                    </p>
                                    {selectedOrder.userId?.contactNumber && (
                                        <p className="text-sm text-gray-500">{selectedOrder.userId.contactNumber}</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wide mb-1">Status</p>
                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedOrder.deliveryStatus || selectedOrder.status)}`}>
                                        {selectedOrder.deliveryStatus || selectedOrder.status}
                                    </span>
                                </div>
                            </div>

                            {selectedOrder.deliveryAddress && (
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wide mb-1">Delivery Address</p>
                                    <p className="text-sm text-gray-900 dark:text-white">
                                        {[
                                            selectedOrder.deliveryAddress.flatNo,
                                            selectedOrder.deliveryAddress.apartment,
                                            selectedOrder.deliveryAddress.address,
                                            selectedOrder.deliveryAddress.landmark,
                                        ].filter(Boolean).join(', ')}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        {selectedOrder.deliveryAddress.city}
                                        {selectedOrder.deliveryAddress.pincode ? ` - ${selectedOrder.deliveryAddress.pincode}` : ''}
                                    </p>
                                    {selectedOrder.deliveryAddress.phone && (
                                        <p className="text-sm text-gray-500 mt-1">📞 {selectedOrder.deliveryAddress.phone}</p>
                                    )}
                                </div>
                            )}

                            {selectedOrder.deliveryInstructions && (
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wide mb-1">Delivery Instructions</p>
                                    <p className="text-sm text-gray-900 dark:text-white italic">"{selectedOrder.deliveryInstructions}"</p>
                                </div>
                            )}

                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wide mb-1">Total Amount</p>
                                <p className="text-2xl font-bold text-primary">₹{selectedOrder.totalAmount || selectedOrder.total}</p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerOrders;
