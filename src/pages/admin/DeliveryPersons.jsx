import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDeliveryPersons, addDeliveryPerson, deleteDeliveryPerson } from '../../redux/slices/deliverySlice';
import { Search, Plus, Trash2, Phone, Mail } from 'lucide-react';
import { toast } from 'react-toastify';
import apiService from '../../services/api';

const DeliveryPersons = () => {
    const dispatch = useDispatch();
    const { deliveryPersons, isLoading } = useSelector((state) => state.delivery);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

    useEffect(() => {
        dispatch(fetchDeliveryPersons());
    }, [dispatch]);

    const filtered = deliveryPersons.filter(
        (d) =>
            d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddDeliveryPerson = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.phone) {
            toast.error('Please fill all required fields');
            return;
        }
        try {
            await apiService.inviteUser({ name: formData.name, email: formData.email, role: 'delivery' });
            toast.success('Invitation sent! They will receive an email to set their password.');
            // Refresh list from server
            dispatch(fetchDeliveryPersons());
        } catch (error) {
            toast.error(error.message || 'Failed to send invitation');
            return;
        }
        setShowAddModal(false);
        setFormData({ name: '', email: '', phone: '' });
    };

    // FIX: Now calls the real API to delete from MongoDB, not just local Redux state.
    const handleDelete = async (id) => {
        if (!window.confirm('Remove this delivery person? They will lose access to the platform.')) return;
        setDeletingId(id);
        try {
            await apiService.deleteDeliveryPerson(id);
            dispatch(deleteDeliveryPerson(id)); // update local state after confirmed API success
            toast.success('Delivery person removed successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to remove delivery person');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Delivery Persons</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Delivery Person
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search delivery persons..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-gray-700 dark:text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 font-medium text-sm">
                            <tr>
                                <th className="px-6 py-3">Delivery Person</th>
                                <th className="px-6 py-3">Contact</th>
                                <th className="px-6 py-3">Rating</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-gray-500">Loading...</td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-gray-500">No delivery persons found</td>
                                </tr>
                            ) : (
                                filtered.map((person) => (
                                    <tr key={person._id || person.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=random`}
                                                    alt=""
                                                    className="h-10 w-10 rounded-full object-cover"
                                                />
                                                <div>
                                                    <span className="font-medium text-gray-900 dark:text-white block">{person.name}</span>
                                                    <span className="text-xs text-gray-500">
                                                        {person.deliveryProfile?.totalDeliveries || 0} deliveries
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1 text-sm">
                                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                                    <Mail className="h-4 w-4 flex-shrink-0" />
                                                    <span className="truncate max-w-[180px]">{person.email}</span>
                                                </div>
                                                {person.contactNumber && (
                                                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                                        <Phone className="h-4 w-4 flex-shrink-0" />
                                                        {person.contactNumber}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-600 dark:text-gray-300">
                                                {person.deliveryProfile?.rating
                                                    ? `${person.deliveryProfile.rating.toFixed(1)} ★`
                                                    : '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                person.deliveryProfile?.isAvailable
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                            }`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${person.deliveryProfile?.isAvailable ? 'bg-green-500' : 'bg-gray-400'}`} />
                                                {person.deliveryProfile?.isAvailable ? 'Available' : 'Offline'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(person._id || person.id)}
                                                disabled={deletingId === (person._id || person.id)}
                                                className="p-2 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                                                title="Remove"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Delivery Person Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Add Delivery Person</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            An invite link will be sent to their email. They set their own password via the link.
                        </p>
                        <form onSubmit={handleAddDeliveryPerson} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone *</label>
                                <input
                                    type="tel"
                                    required
                                    placeholder="+91 98765 43210"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => { setShowAddModal(false); setFormData({ name: '', email: '', phone: '' }); }}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-gray-800">
                                    Send Invite
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliveryPersons;
