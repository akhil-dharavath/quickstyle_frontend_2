import { Helmet } from 'react-helmet-async';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateQuantity, removeFromCart, applyCoupon, removeCoupon } from '../../redux/slices/cartSlice';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const Cart = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items, total, discount, coupon } = useSelector(state => state.cart);
    const [couponInput, setCouponInput] = useState('');

    const handleCheckout = () => {
        toast.success('Proceeding to checkout...');
        navigate('/checkout');
    };

    const handleApplyCoupon = () => {
        if (!couponInput.trim()) return;
        // Basic validation for better UX, though reducer handles logic
        if (couponInput.toUpperCase() === 'SAVE20' || couponInput.toUpperCase() === 'WELCOME10') {
            dispatch(applyCoupon(couponInput));
            toast.success(`Coupon ${couponInput.toUpperCase()} applied!`);
            setCouponInput('');
        } else {
            toast.error('Invalid Coupon Code');
        }
    };

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 mb-4"
                >
                    <ShoppingBag className="h-16 w-16" />
                </motion.div>
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-center space-y-2"
                >
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Your cart is empty</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">Looks like you haven't added anything yet.</p>
                </motion.div>
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Link to="/" className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white text-lg font-bold rounded-2xl hover:bg-[#2a2a2a] transition-all hover:scale-105 shadow-xl shadow-primary/20">
                        Start Shopping <ArrowRight className="h-5 w-5" />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
            <Helmet>
                <title>Your Cart | QuickStyle</title>
            </Helmet>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Shopping Cart <span className="text-lg font-normal text-gray-500 ml-2">({items.length} items)</span></h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-2">
                    <AnimatePresence mode='popLayout'>
                        {items.map(item => (
                            <motion.div
                                key={item.cartItemId}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow flex gap-4 items-center group relative overflow-hidden"
                            >
                                {/* Compact Image */}
                                <div className="h-24 w-24 rounded-xl bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-600">
                                    <img src={item?.images[0]} alt={item.name} className="w-full h-full object-cover" />
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="text-base font-bold text-gray-900 dark:text-white truncate pr-4 font-heading">
                                            <Link to={`/product/${(item._id || item.id)}`} className="hover:text-primary transition-colors">
                                                {item.name}
                                            </Link>
                                        </h3>
                                        <button
                                            onClick={() => dispatch(removeFromCart(item.cartItemId))}
                                            className="text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-3 text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">
                                        <span className="flex items-center gap-1">
                                            Size: <span className="text-gray-700 dark:text-gray-300 font-bold">{item.selectedSize}</span>
                                        </span>
                                        <span className="flex items-center gap-1">
                                            Color:
                                            <span className="w-3 h-3 rounded-full border border-gray-200 dark:border-gray-600" style={{ backgroundColor: item.selectedColor?.toLowerCase() }} />
                                            <span className="text-gray-700 dark:text-gray-300 font-bold">{item.selectedColor}</span>
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        {/* Quantity Controls - Compact */}
                                        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/50 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <button
                                                onClick={() => dispatch(updateQuantity({ id: item.cartItemId, quantity: item.quantity - 1 }))}
                                                className="w-6 h-6 rounded bg-white dark:bg-gray-800 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm disabled:opacity-50 transition-colors"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus className="h-3 w-3 text-gray-600 dark:text-gray-300" />
                                            </button>
                                            <span className="font-bold text-sm w-4 text-center text-gray-900 dark:text-white">{item.quantity}</span>
                                            <button
                                                onClick={() => dispatch(updateQuantity({ id: item.cartItemId, quantity: item.quantity + 1 }))}
                                                className="w-6 h-6 rounded bg-white dark:bg-gray-800 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm transition-colors"
                                            >
                                                <Plus className="h-3 w-3 text-gray-600 dark:text-gray-300" />
                                            </button>
                                        </div>

                                        {/* Price */}
                                        <div className="text-right">
                                            <span className="text-lg font-bold text-gray-900 dark:text-white">₹{item.price * item.quantity}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl sticky top-24">
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Order Summary</h3>

                        {/* Coupon Section */}
                        <div className="mb-8">
                            {!coupon ? (
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Enter coupon code"
                                        className="w-full pl-4 pr-24 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-gray-50 dark:bg-gray-900 dark:text-white transition-all"
                                        value={couponInput}
                                        onChange={(e) => setCouponInput(e.target.value)}
                                    />
                                    <button
                                        onClick={handleApplyCoupon}
                                        className="absolute right-1 top-1 bottom-1 px-4 bg-gray-900 dark:bg-gray-700 text-white rounded-lg text-sm font-bold hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        APPLY
                                    </button>
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-700 dark:text-green-400"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-green-500/20 rounded-full">
                                            <Tag className="h-4 w-4" />
                                        </div>
                                        <span className="font-bold text-sm tracking-wide">'{coupon}' Applied</span>
                                    </div>
                                    <button
                                        onClick={() => dispatch(removeCoupon())}
                                        className="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </motion.div>
                            )}
                            <p className="text-xs text-gray-400 mt-3 ml-1">Available codes: <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">SAVE20</span> <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">WELCOME10</span></p>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-gray-500 dark:text-gray-400">
                                <span>Subtotal</span>
                                <span className="font-medium text-gray-900 dark:text-white">₹{total}</span>
                            </div>
                            <div className="flex justify-between text-gray-500 dark:text-gray-400">
                                <span>Shipping</span>
                                <span className="font-medium text-gray-900 dark:text-white">₹40</span>
                            </div>
                            <div className="flex justify-between text-gray-500 dark:text-gray-400">
                                <span>Taxes (5% GST)</span>
                                <span className="font-medium text-gray-900 dark:text-white">₹{Math.round(total * 0.05)}</span>
                            </div>
                            {discount > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex justify-between text-green-600 dark:text-green-400 font-bold"
                                >
                                    <span>Discount</span>
                                    <span>-₹{discount}</span>
                                </motion.div>
                            )}
                            <div className="h-px bg-gray-100 dark:border-gray-700 my-2"></div>
                            <div className="flex justify-between items-baseline">
                                <span className="text-lg font-medium text-gray-900 dark:text-white">Total</span>
                                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                                    ₹{total + Math.round(total * 0.05) - discount + 40}
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 text-right mt-1">Include all taxes</p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleCheckout}
                            className="w-full flex items-center justify-center py-3 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-[#2a2a2a] transition-all shadow-lg shadow-primary/25"
                        >
                            Checkout <ArrowRight className="ml-2 h-5 w-5" />
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
