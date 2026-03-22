import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, deleteProduct } from '../../redux/slices/productSlice';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import ProductEditModal from '../../components/common/ProductEditModal';
import Pagination from '../../components/common/Pagination';
import apiService from '../../services/api';

const SellerProducts = () => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const { products, isLoading } = useSelector(state => state.products);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [myShopId, setMyShopId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        dispatch(fetchProducts());
        // Fetch my shop to get the correct shopId for filtering
        apiService.getMyShop().then(res => {
            if (res.data?._id) setMyShopId(res.data._id);
        }).catch(() => {});
    }, [dispatch]);

    // FIX: Filter by actual shop _id (not user _id, not sellerId which doesn't exist)
    // Products have shopId which is the Shop document's _id
    const myProducts = products.filter(p => {
        if (!p.shopId) return false;
        const shopId = p.shopId?._id || p.shopId;
        return shopId === myShopId;
    });

    const filteredProducts = myProducts.filter(p =>
        (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => { setCurrentPage(1); }, [searchTerm]);

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await dispatch(deleteProduct(id)).unwrap();
            toast.success('Product deleted successfully');
        } catch (error) {
            toast.error(error || 'Failed to delete product');
        }
    };

    const showAll = !myShopId; // Before shop is loaded, show all seller's products
    const displayProducts = showAll ? [] : currentProducts;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">My Products</h2>
                    {!myShopId && (
                        <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                            ⚠️ Set up your shop first in the Shop tab to manage products.
                        </p>
                    )}
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    disabled={!myShopId}
                    className="flex items-center px-4 py-2 bg-secondary text-white rounded-lg hover:bg-pink-600 transition-colors shadow-lg shadow-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Product
                </button>
            </div>

            <div className="mb-4">
                <input type="text" placeholder="Search products..."
                    className="w-full max-w-sm px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : !myShopId ? (
                <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                    <p>Configure your shop to start adding products.</p>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'No products match your search.' : 'No products yet. Click Add Product to get started.'}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {currentProducts.map(product => (
                            <div key={product._id || product.id}
                                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden group hover:shadow-lg transition-all">
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400'}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => setEditingProduct(product)}
                                            className="p-2 bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 rounded-full hover:text-secondary">
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => handleDeleteProduct(product._id || product.id)}
                                            className="p-2 bg-white/90 text-red-500 rounded-full hover:bg-red-50">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    {/* Approval status badge */}
                                    <div className="absolute top-2 left-2">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                                            product.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' :
                                            product.approvalStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'}`}>
                                            {product.approvalStatus || 'pending'}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{product.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{product.category}</p>
                                    <div className="flex justify-between items-end mt-3">
                                        <span className="text-lg font-bold text-gray-900 dark:text-white">₹{product.price}</span>
                                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">
                                            Stock: {product.stock ?? 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Pagination currentPage={currentPage} totalItems={filteredProducts.length}
                        itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
                </>
            )}

            {(editingProduct || showAddModal) && myShopId && (
                <ProductEditModal
                    product={editingProduct}
                    onClose={() => { setEditingProduct(null); setShowAddModal(false); }}
                    isAdmin={false}
                    sellerId={myShopId}
                />
            )}
        </div>
    );
};

export default SellerProducts;
