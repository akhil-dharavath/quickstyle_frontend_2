import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import ProductCard from '../../components/customer/ProductCard';

const Wishlist = () => {
    // Mock wishlist items if redux is empty for now, or assume redux works
    // In a real app we'd selector from state.wishlist
    // For now, let's assume the ProductCard handles the "isInWishlist" check internally or we pass products
    // But usually Wishlist page iterates over the liked products.
    // I'll grab all products and filter for "liked" mock, or just show a placeholder if no logic exists yet.
    // The previous implementation likely had a wishlist slice.

    const { products } = useSelector(state => state.products);
    const { items: wishlistItems } = useSelector(state => state.wishlist);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-heading font-bold mb-8">Your Wishlist</h1>

            {wishlistItems.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    <AnimatePresence>
                        {wishlistItems.map((product) => (
                            <ProductCard key={(product._id || product.id)} product={product} />
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="text-center py-32 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <Heart className="h-10 w-10 text-gray-400" />
                    </motion.div>
                    <h2 className="text-2xl font-bold font-heading mb-2">Your wishlist is empty</h2>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                        Save items you love to your wishlist. Review them anytime and easily move them to the bag.
                    </p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-bold rounded-full hover:scale-105 transition-transform"
                    >
                        Start Shopping
                        <ArrowRight className="h-5 w-5" />
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Wishlist;
