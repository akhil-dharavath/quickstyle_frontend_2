import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, deleteProduct, approveProduct, updateProduct } from '../../redux/slices/productSlice';
import { fetchSellers } from '../../redux/slices/sellerSlice';
import { Search, Plus, Edit2, Trash2, X, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import ProductEditModal from '../../components/common/ProductEditModal';
import Pagination from '../../components/common/Pagination';

const Products = () => {
    const dispatch = useDispatch();
    const { products, isLoading } = useSelector((state) => state.products);
    const { sellers } = useSelector((state) => state.sellers);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        dispatch(fetchProducts());
        dispatch(fetchSellers());
    }, [dispatch]);

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

    // Reset page on search
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await dispatch(deleteProduct(id)).unwrap();
            toast.success('Product deleted successfully');
        } catch (error) {
            toast.error(error || 'Failed to delete product');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Products Management</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-[#2a2a2a] transition-colors"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Product
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 font-medium text-sm">
                            <tr>
                                <th className="px-6 py-3">Product</th>
                                <th className="px-6 py-3">Category</th>
                                <th className="px-6 py-3">Price</th>
                                <th className="px-6 py-3">Stock</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {isLoading ? (
                                <tr><td colSpan="5" className="text-center py-8">Loading...</td></tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-8 text-gray-500">No products found</td></tr>
                            ) : (
                                currentProducts.map((product) => (
                                    <tr key={(product._id || product.id)} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={product.image} alt="" className="h-10 w-10 rounded-md object-cover bg-gray-100" />
                                                <span className="font-medium text-gray-900">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{product.category}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">₹{product.price}</td>
                                        <td className="px-6 py-4 text-gray-600">{product.stock}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${product.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' :
                                                    product.approvalStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {product.approvalStatus || 'pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {(!product.approvalStatus || product.approvalStatus === 'pending') && (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            dispatch(approveProduct({ productId: (product._id || product.id) || product._id, status: 'approved' }));
                                                            dispatch(updateProduct({ id: (product._id || product.id) || product._id, approvalStatus: 'approved' }));
                                                        }}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors mr-1"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            dispatch(approveProduct({ productId: (product._id || product.id) || product._id, status: 'rejected' }));
                                                            dispatch(updateProduct({ id: (product._id || product.id) || product._id, approvalStatus: 'rejected' }));
                                                        }}
                                                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors mr-2"
                                                        title="Reject"
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => setEditingProduct(product)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors mr-2 text-left"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct((product._id || product.id) || product._id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalItems={filteredProducts.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                />
            </div>

            {/* Add / Edit Product Modal */}
            {(showAddModal || editingProduct) && (
                <ProductEditModal
                    product={editingProduct}
                    onClose={() => { setEditingProduct(null); setShowAddModal(false); }}
                    isAdmin={true}
                    sellerId={sellers?.[0]?.id || 'u2'}
                />
            )}
        </div>
    );
};

export default Products;
