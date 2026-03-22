import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSellers, addSeller, updateSellerStatus, deleteSeller } from '../../redux/slices/sellerSlice';
import { Search, Plus, Trash2, Ban, CheckCircle, Navigation } from 'lucide-react';
import { getCurrentLocationAddress } from '../../utils/geolocation';
import { toast } from 'react-toastify';
import Pagination from '../../components/common/Pagination';
import apiService from '../../services/api';

const Sellers = () => {
    const dispatch = useDispatch();
    const { sellers, isLoading } = useSelector((state) => state.sellers);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [formData, setFormData] = useState({
        name: '', owner: '', email: '', phone: '',
        packingAddress: { address: '', city: '', state: '', pincode: '' },
        gstin: '', businessType: 'Retail'
    });
    const [isLocating, setIsLocating] = useState(false);

    const handleUseCurrentLocation = async () => {
        setIsLocating(true);
        try {
            const loc = await getCurrentLocationAddress();
            setFormData(prev => ({
                ...prev,
                packingAddress: { ...prev.packingAddress, address: loc.address || '', city: loc.city || '', state: loc.state || '', pincode: loc.pincode || '', lat: loc.lat, lng: loc.lng },
            }));
            toast.success('Location fetched!');
        } catch (err) {
            toast.error(err.message || 'Unable to retrieve location');
        } finally {
            setIsLocating(false);
        }
    };

    useEffect(() => {
        dispatch(fetchSellers());
    }, [dispatch]);

    // FIX: seller.owner is an ObjectId on the server — when fetched it may be a
    // string representation. Safe comparison uses String().includes()
    const filteredSellers = sellers.filter(seller => {
        const name = (seller.name || '').toLowerCase();
        // owner may be ObjectId string or a name string — safe search on name only
        const ownerStr = typeof seller.owner === 'string' ? seller.owner.toLowerCase() : '';
        return name.includes(searchTerm.toLowerCase()) || ownerStr.includes(searchTerm.toLowerCase());
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentSellers = filteredSellers.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

    const handleAddSeller = async (e) => {
        e.preventDefault();
        try {
            await apiService.inviteUser({ name: formData.owner, email: formData.email, role: 'seller' });
            toast.success('Invitation sent! They can set their password via email link.');
        } catch (error) {
            toast.error(error.message || 'Failed to send invitation. Check email configuration.');
            return;
        }
        const packingWithCoords = {
            ...formData.packingAddress,
            lat: formData.packingAddress.lat ?? 17.44 + (Math.random() - 0.5) * 0.1,
            lng: formData.packingAddress.lng ?? 78.37 + (Math.random() - 0.5) * 0.1
        };
        dispatch(addSeller({ ...formData, packingAddress: packingWithCoords }));
        dispatch(fetchSellers()); // refresh from server
        setShowAddModal(false);
        setFormData({ name: '', owner: '', email: '', phone: '', packingAddress: { address: '', city: '', state: '', pincode: '' }, gstin: '', businessType: 'Retail' });
    };

    const toggleBlock = (id, currentStatus) => {
        dispatch(updateSellerStatus({ id, isBlocked: !currentStatus }));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Sellers Management</h2>
                <button onClick={() => setShowAddModal(true)}
                    className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-[#2a2a2a] transition-colors">
                    <Plus className="h-5 w-5 mr-2" /> Add Seller
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input type="text" placeholder="Search sellers..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none"
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 font-medium text-sm">
                            <tr>
                                <th className="px-6 py-3">Shop Name</th>
                                <th className="px-6 py-3">Location</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {isLoading ? (
                                <tr><td colSpan="4" className="text-center py-8 text-gray-500">Loading...</td></tr>
                            ) : filteredSellers.length === 0 ? (
                                <tr><td colSpan="4" className="text-center py-8 text-gray-500 dark:text-gray-400">No sellers found</td></tr>
                            ) : currentSellers.map((seller) => (
                                <tr key={seller._id || seller.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                                                {(seller.name || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-900 dark:text-white block">{seller.name || '—'}</span>
                                                <span className="text-xs text-gray-500">
                                                    {seller.deliveryRadiusKm ? `${seller.deliveryRadiusKm}km radius` : ''}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-sm">
                                        {seller.location?.address || (seller.location?.coordinates ? `${seller.location.coordinates[1]?.toFixed(4)}, ${seller.location.coordinates[0]?.toFixed(4)}` : '—')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${seller.isActive === false || seller.isBlocked ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>
                                            {seller.isBlocked ? 'Blocked' : seller.isActive === false ? 'Inactive' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        <button onClick={() => toggleBlock(seller._id || seller.id, seller.isBlocked)}
                                            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${seller.isBlocked ? 'text-green-600' : 'text-amber-600'}`}
                                            title={seller.isBlocked ? 'Unblock' : 'Block'}>
                                            {seller.isBlocked ? <CheckCircle className="h-5 w-5" /> : <Ban className="h-5 w-5" />}
                                        </button>
                                        <button onClick={() => dispatch(deleteSeller(seller._id || seller.id))}
                                            className="p-2 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-2"
                                            title="Delete">
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination currentPage={currentPage} totalItems={filteredSellers.length}
                    itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
            </div>

            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Add New Seller</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            An invite link will be sent to their email to set up access.
                        </p>
                        <form onSubmit={handleAddSeller} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store Name *</label>
                                    <input type="text" required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Owner Name *</label>
                                    <input type="text" required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" value={formData.owner} onChange={(e) => setFormData({ ...formData, owner: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                                    <input type="email" required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone *</label>
                                    <input type="tel" required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Packing Address</label>
                                <button type="button" onClick={handleUseCurrentLocation} disabled={isLocating}
                                    className="mb-2 flex items-center gap-2 text-sm text-primary font-medium disabled:opacity-50">
                                    {isLocating ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <Navigation className="h-4 w-4" />}
                                    Use Current Location
                                </button>
                                <input type="text" required placeholder="Street, Building" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white mb-2" value={formData.packingAddress.address} onChange={(e) => setFormData({ ...formData, packingAddress: { ...formData.packingAddress, address: e.target.value } })} />
                                <div className="grid grid-cols-3 gap-2">
                                    <input type="text" required placeholder="City" className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" value={formData.packingAddress.city} onChange={(e) => setFormData({ ...formData, packingAddress: { ...formData.packingAddress, city: e.target.value } })} />
                                    <input type="text" required placeholder="State" className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" value={formData.packingAddress.state} onChange={(e) => setFormData({ ...formData, packingAddress: { ...formData.packingAddress, state: e.target.value } })} />
                                    <input type="text" required placeholder="Pincode" className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" value={formData.packingAddress.pincode} onChange={(e) => setFormData({ ...formData, packingAddress: { ...formData.packingAddress, pincode: e.target.value } })} />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-[#2a2a2a]">Send Invite</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sellers;
