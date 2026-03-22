import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingBag, Package, TrendingUp } from 'lucide-react';
import { fetchShopOrders } from '../../redux/slices/orderSlice';
import { fetchProducts } from '../../redux/slices/productSlice';

const SellerDashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const { products } = useSelector(state => state.products);
    const { orders } = useSelector(state => state.orders);

    useEffect(() => {
        // FIX: Fetch shop-scoped orders and all products on mount
        dispatch(fetchShopOrders());
        dispatch(fetchProducts());
    }, [dispatch]);

    // FIX: fetchShopOrders replaces state.orders with this seller's orders only
    const sellerOrders = orders;

    const totalRevenue = sellerOrders
        .filter(o => (o.deliveryStatus || o.status) !== 'Cancelled')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const activeOrders = sellerOrders.filter(o =>
        ['Pending','Confirmed','Preparing','Ready for Pickup','Picked Up','On the way'].includes(o.deliveryStatus || o.status)
    ).length;

    // Build chart from real orders (last 7 days)
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const salesByDay = {};
    days.forEach(d => (salesByDay[d] = 0));
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    sellerOrders.forEach(o => {
        const d = new Date(o.createdAt);
        if (d >= oneWeekAgo && (o.deliveryStatus || o.status) !== 'Cancelled') {
            salesByDay[days[d.getDay()]] += o.totalAmount || 0;
        }
    });
    const salesData = days.map(d => ({ name: d, sales: salesByDay[d] }));

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                    <h3 className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${
                    color==='indigo' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' :
                    color==='pink'   ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600' :
                    color==='blue'   ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                                       'bg-amber-100 dark:bg-amber-900/30 text-amber-600'}`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome, {user?.name}</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Here's your store overview.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Revenue" value={`₹${totalRevenue.toLocaleString('en-IN')}`} icon={DollarSign} color="indigo" />
                <StatCard title="Total Orders" value={sellerOrders.length} icon={ShoppingBag} color="pink" />
                <StatCard title="Active Orders" value={activeOrders} icon={TrendingUp} color="amber" />
                <StatCard title="Products (All)" value={products.length} icon={Package} color="blue" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Weekly Revenue</h3>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill:'#6B7280', fontSize:12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill:'#6B7280', fontSize:12 }} />
                                <Tooltip contentStyle={{ backgroundColor:'#fff', borderRadius:'8px', border:'none', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                                <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Recent Orders</h3>
                    {sellerOrders.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">No orders yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-gray-500 dark:text-gray-400 font-medium text-xs uppercase">
                                    <tr>
                                        <th className="px-4 py-2">ID</th>
                                        <th className="px-4 py-2">Items</th>
                                        <th className="px-4 py-2">Amount</th>
                                        <th className="px-4 py-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {sellerOrders.slice(0,5).map(order => {
                                        const status = order.deliveryStatus || order.status;
                                        return (
                                            <tr key={order._id || order.id} className="text-sm">
                                                <td className="px-4 py-2 font-mono text-xs text-gray-900 dark:text-gray-100">
                                                    #{(order._id||order.id)?.slice(-6).toUpperCase()}
                                                </td>
                                                <td className="px-4 py-2 text-gray-500">{order.items?.length||0} items</td>
                                                <td className="px-4 py-2 font-semibold text-gray-900 dark:text-white">₹{order.totalAmount||0}</td>
                                                <td className="px-4 py-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                        status==='Delivered'?'bg-green-100 text-green-800':
                                                        status==='Cancelled'?'bg-red-100 text-red-800':
                                                        'bg-blue-100 text-blue-800'}`}>
                                                        {status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SellerDashboard;
