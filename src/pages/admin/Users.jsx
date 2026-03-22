import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, toggleUserStatusAsync, deleteUserAsync } from '../../redux/slices/userSlice';
import { Search, Filter, Ban, CheckCircle, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import Pagination from '../../components/common/Pagination';

const Users = () => {
    const dispatch = useDispatch();
    const { users, isLoading } = useSelector(state => state.users);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => { dispatch(fetchUsers()); }, [dispatch]);

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'All' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, roleFilter]);

    const handleToggleStatus = (id, currentStatus) => {
        dispatch(toggleUserStatusAsync(id));
        toast.info(`User ${currentStatus === 'Active' ? 'blocked' : 'activated'}`);
    };

    const handleDelete = (id, role) => {
        if (role === 'admin') return;
        if (!window.confirm('Delete this user? This cannot be undone.')) return;
        dispatch(deleteUserAsync(id));
        toast.success('User deleted');
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'admin':    return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case 'seller':   return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300';
            case 'delivery': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
            default:         return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">User Management</h2>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input type="text" placeholder="Search users..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-gray-500" />
                        <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none"
                            value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                            <option value="All">All Roles</option>
                            <option value="customer">Customer</option>
                            <option value="seller">Seller</option>
                            <option value="delivery">Delivery</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 font-medium text-sm">
                            <tr>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Joined</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {isLoading ? (
                                <tr><td colSpan="5" className="text-center py-8 dark:text-gray-400">Loading...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-8 text-gray-500 dark:text-gray-400">No users found</td></tr>
                            ) : currentUsers.map((user) => (
                                <tr key={user._id || user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {/* FIX: user.avatar doesn't exist in DB — use ui-avatars fallback */}
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=random&size=40`}
                                                alt=""
                                                className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                                            />
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleBadge(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'Blocked' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>
                                            <span className={`h-1.5 w-1.5 rounded-full ${user.status === 'Blocked' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                            {user.status || 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
                                        {/* FIX: user.joined doesn't exist — use user.createdAt from MongoDB timestamps */}
                                        {user.createdAt
                                            ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                            : '—'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleToggleStatus(user._id || user.id, user.status || 'Active')}
                                                className={`p-2 rounded-lg transition-colors ${(user.status === 'Blocked')
                                                    ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                    : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20'}`}
                                                title={(user.status === 'Blocked') ? 'Activate User' : 'Block User'}
                                            >
                                                {(user.status === 'Blocked') ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                                            </button>
                                            {user.role !== 'admin' && (
                                                <button
                                                    onClick={() => handleDelete(user._id || user.id, user.role)}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination currentPage={currentPage} totalItems={filteredUsers.length}
                    itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
            </div>
        </div>
    );
};

export default Users;
