import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, ShoppingBag, DollarSign, Package } from 'lucide-react';
import apiService from '../../services/api';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <h3 className="text-2xl font-bold mt-1 text-gray-900">{value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
        </div>
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await apiService.getDashboardStats();
                setStats(res.data);
            } catch (error) {
                console.error("Failed to load dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading || !stats) {
        return <div className="p-8 text-center text-gray-500">Loading Dashboard Analytics...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Revenue" value={`₹${stats.totalRevenue?.toLocaleString()}`} icon={DollarSign} color="bg-green-500" />
                <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingBag} color="bg-blue-500" />
                <StatCard title="Total Users" value={stats.totalUsers || 0} icon={Users} color="bg-indigo-500" />
                <StatCard title="Total Sellers" value={stats.totalSellers} icon={Package} color="bg-purple-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-4 text-gray-800">Sales Analytics</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="sales" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-4 text-gray-800">Order Status Distribution</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.orderStatusData || []}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    innerRadius={60}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {(stats.orderStatusData || []).map((entry, index) => {
                                        const colors = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'];
                                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                    })}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-4 text-gray-800">Top Products</h3>
                    <div className="space-y-4">
                        {stats.topProducts && stats.topProducts.map((p, i) => (
                            <div key={p._id || i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                <div className="flex items-center gap-3">
                                    {p.imageUrl ? 
                                        <img src={p.imageUrl} alt={p.name} className="h-10 w-10 rounded-md object-cover" /> :
                                        <div className="h-10 w-10 bg-gray-200 rounded-md flex-shrink-0"></div>
                                    }
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                                        <p className="text-xs text-gray-500">{p.category}</p>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-gray-900 ml-4">₹{p.price}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-4 text-gray-800">Recent Orders</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="py-3 px-4 text-sm font-medium text-gray-500">Order ID</th>
                                <th className="py-3 px-4 text-sm font-medium text-gray-500">Customer</th>
                                <th className="py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                                <th className="py-3 px-4 text-sm font-medium text-gray-500">Amount</th>
                                <th className="py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(stats.recentOrders || []).map((order) => (
                                <tr key={order._id || order.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                    <td className="py-3 px-4 font-mono text-sm text-gray-900">#{order._id || order.id}</td>
                                    <td className="py-3 px-4 text-sm text-gray-600">{order.userId?.name || 'Guest'}</td>
                                    <td className="py-3 px-4 text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="py-3 px-4 text-sm font-medium text-gray-900">₹{order.totalAmount}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                            order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                            order.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                                            'bg-blue-100 text-blue-800' 
                                        }`}>{order.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
