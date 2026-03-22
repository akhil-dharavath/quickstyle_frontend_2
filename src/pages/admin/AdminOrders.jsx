import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDeliveryPersons } from '../../redux/slices/deliverySlice';
import { Search, Filter, Eye, X } from 'lucide-react';
import { toast } from 'react-toastify';
import Pagination from '../../components/common/Pagination';
import apiService from '../../services/api';

// FIX: Admin Orders page now calls /admin/orders which populates userId (name/email) + shopId (name)
// Previously it called /orders/myorders (customer endpoint), showed customerId (raw ObjectId) and
// had no customer name, no shop name, and showed order.total which is undefined on DB docs.

const AdminOrders = () => {
    const dispatch = useDispatch();
    const { deliveryPersons } = useSelector(state => state.delivery);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isUpdating, setIsUpdating] = useState(false);
    const itemsPerPage = 10;

    useEffect(() => {
        dispatch(fetchDeliveryPersons());
        loadOrders();
    }, [dispatch]);

    const loadOrders = async () => {
        try {
            setIsLoading(true);
            const res = await apiService.getAdminOrders();
            setOrders(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            toast.error('Failed to load orders');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const id = (order._id || order.id)?.toString().toLowerCase();
        const customerName = order.userId?.name?.toLowerCase() || '';
        const matchesSearch = id.includes(searchTerm.toLowerCase()) || customerName.includes(searchTerm.toLowerCase());
        const status = order.deliveryStatus || order.status;
        const matchesStatus = statusFilter === 'All' || status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

    const handleMarkReadyForPickup = async (order) => {
        setIsUpdating(true);
        try {
            await apiService.updateOrderStatusBySeller(order._id || order.id, 'Ready for Pickup');
            await loadOrders();
            toast.success('Order marked Ready for Pickup');
            setSelectedOrder(null);
        } catch (error) {
            toast.error(error.message || "Failed to update status");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleAssignDelivery = async (orderId, deliveryPersonId) => {
        if (!deliveryPersonId) return;
        setIsUpdating(true);
        try {
            await apiService.updateDeliveryStatus(orderId, { status: 'Picked Up', deliveryPersonId });
            await loadOrders();
            toast.success('Delivery person assigned');
            setSelectedOrder(null);
        } catch (error) {
            toast.error(error.message || "Failed to assign delivery");
        } finally {
            setIsUpdating(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'On the way': case 'Picked Up': case 'Out for Delivery': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'Ready for Pickup': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case 'Pending': case 'Confirmed': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'Cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Order Management</h2>
                <button onClick={loadOrders} className="text-sm text-primary hover:underline font-medium">↻ Refresh</button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input type="text" placeholder="Search by Order ID or Customer..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-gray-500" />
                        <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none"
                            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="All">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Ready for Pickup">Ready for Pickup</option>
                            <option value="Picked Up">Picked Up</option>
                            <option value="On the way">On the way</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 font-medium text-sm">
                            <tr>
                                <th className="px-6 py-3">Order ID</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Shop</th>
                                <th className="px-6 py-3">Total</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {isLoading ? (
                                <tr><td colSpan="7" className="text-center py-8 dark:text-gray-400">Loading...</td></tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr><td colSpan="7" className="text-center py-8 text-gray-500 dark:text-gray-400">No orders found</td></tr>
                            ) : (
                                currentOrders.map((order) => (
                                    <tr key={order._id || order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-sm text-gray-900 dark:text-gray-100">
                                            #{(order._id || order.id)?.slice(-8).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        {/* FIX: Show populated customer name instead of raw ObjectId */}
                                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300 text-sm">
                                            <div>{order.userId?.name || 'N/A'}</div>
                                            <div className="text-xs text-gray-400">{order.userId?.email}</div>
                                        </td>
                                        {/* FIX: Show shop name */}
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
                                            {order.shopId?.name || '—'}
                                        </td>
                                        {/* FIX: Use totalAmount (API field), not total which is undefined */}
                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">
                                            ₹{order.totalAmount || 0}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.deliveryStatus || order.status)}`}>
                                                {order.deliveryStatus || order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => setSelectedOrder(order)}
                                                className="p-2 text-primary hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
                                                <Eye className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination currentPage={currentPage} totalItems={filteredOrders.length}
                    itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                Order #{(selectedOrder._id || selectedOrder.id)?.slice(-8).toUpperCase()}
                            </h3>
                            <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Customer</h4>
                                    <p className="text-gray-900 dark:text-gray-100 font-medium">{selectedOrder.userId?.name || 'N/A'}</p>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">{selectedOrder.userId?.email}</p>
                                    {selectedOrder.userId?.contactNumber && (
                                        <p className="text-gray-500 text-sm">📞 {selectedOrder.userId.contactNumber}</p>
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Order Info</h4>
                                    <p className="text-gray-900 dark:text-gray-100 text-sm">
                                        {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                                    </p>
                                    <p className="text-gray-600 text-sm">Shop: {selectedOrder.shopId?.name || '—'}</p>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusColor(selectedOrder.deliveryStatus || selectedOrder.status)}`}>
                                        {selectedOrder.deliveryStatus || selectedOrder.status}
                                    </span>
                                </div>
                            </div>

                            {selectedOrder.deliveryAddress && (
                                <div>
                                    <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Delivery Address</h4>
                                    <p className="text-gray-900 dark:text-gray-100">
                                        {[selectedOrder.deliveryAddress.flatNo, selectedOrder.deliveryAddress.apartment,
                                          selectedOrder.deliveryAddress.address, selectedOrder.deliveryAddress.landmark].filter(Boolean).join(', ')}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                                        {selectedOrder.deliveryAddress.city} — {selectedOrder.deliveryAddress.pincode}
                                    </p>
                                    <p className="text-gray-500 text-sm">📞 {selectedOrder.deliveryAddress.phone}</p>
                                </div>
                            )}

                            <div>
                                <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-3">Items</h4>
                                <div className="space-y-3">
                                    {selectedOrder.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                {(item.image || item.productId?.images?.[0]) && (
                                                    <img src={item.image || item.productId?.images?.[0]} alt={item.name}
                                                        className="h-10 w-10 rounded-md object-cover bg-gray-200" />
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                                        {item.name || item.productId?.name || 'Product'}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">₹{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Total Amount</span>
                                <span className="text-2xl font-bold text-primary">₹{selectedOrder.totalAmount}</span>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 space-y-4">
                            {(['Pending', 'Confirmed'].includes(selectedOrder.deliveryStatus || selectedOrder.status)) && (
                                <div className="flex flex-wrap gap-3">
                                    <button onClick={() => handleMarkReadyForPickup(selectedOrder)} disabled={isUpdating}
                                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 text-sm font-medium">
                                        {isUpdating ? 'Updating...' : 'Mark Ready for Pickup'}
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm text-gray-600 dark:text-gray-400">Assign Delivery:</label>
                                        <select disabled={isUpdating}
                                            className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 text-sm"
                                            onChange={(e) => handleAssignDelivery(selectedOrder._id || selectedOrder.id, e.target.value)}>
                                            <option value="">Select...</option>
                                            {deliveryPersons.filter((d) => !d.deliveryProfile?.assignedOrderId).map((dp) => (
                                                <option key={dp._id || dp.id} value={dp._id || dp.id}>{dp.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}
                            <div className="flex justify-end">
                                <button onClick={() => setSelectedOrder(null)}
                                    className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 text-sm">
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

export default AdminOrders;
