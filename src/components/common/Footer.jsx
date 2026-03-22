import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Facebook, Twitter, Instagram, Youtube, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
    const { user } = useSelector(state => state.auth);
    const role = user?.role || 'customer';

    return (
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center mb-4">
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                                QuickStyle
                            </h2>
                        </Link>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                            Your one-stop destination for trendy fashion delivered in minutes. Experience the speed of style.
                        </p>
                        <div className="flex space-x-4">
                            <a href="https://facebook.com/quickstyle" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors"><Facebook size={20} /></a>
                            <a href="https://twitter.com/quickstyle" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors"><Twitter size={20} /></a>
                            <a href="https://instagram.com/quickstyle" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors"><Instagram size={20} /></a>
                            <a href="https://youtube.com/quickstyle" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors"><Youtube size={20} /></a>
                        </div>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Company</h3>
                        <ul className="space-y-3">
                            <li><Link to="/about" className="text-gray-600 dark:text-gray-400 hover:text-primary text-sm">About Us</Link></li>
                            <li><Link to="/contact" className="text-gray-600 dark:text-gray-400 hover:text-primary text-sm">Contact Us</Link></li>
                            <li><Link to="/services" className="text-gray-600 dark:text-gray-400 hover:text-primary text-sm">Services</Link></li>
                        </ul>
                    </div>

                    {/* Quick/Role Links */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                            {role === 'customer' || !role ? 'Shop' : 'Dashboard'}
                        </h3>
                        <ul className="space-y-3">
                            {(!role || role === 'customer') && (
                                <>
                                    <li><Link to="/search?q=Men" className="text-gray-600 dark:text-gray-400 hover:text-primary text-sm">Men</Link></li>
                                    <li><Link to="/search?q=Women" className="text-gray-600 dark:text-gray-400 hover:text-primary text-sm">Women</Link></li>
                                    <li><Link to="/search?q=Footwear" className="text-gray-600 dark:text-gray-400 hover:text-primary text-sm">Footwear</Link></li>
                                    <li><Link to="/search?q=New" className="text-gray-600 dark:text-gray-400 hover:text-primary text-sm">New Arrivals</Link></li>
                                </>
                            )}
                            {role === 'seller' && (
                                <>
                                    <li><Link to="/seller" className="text-gray-600 dark:text-gray-400 hover:text-primary text-sm">Seller Dashboard</Link></li>
                                    <li><Link to="/seller/products" className="text-gray-600 dark:text-gray-400 hover:text-primary text-sm">My Products</Link></li>
                                    <li><Link to="/seller/orders" className="text-gray-600 dark:text-gray-400 hover:text-primary text-sm">Manage Orders</Link></li>
                                </>
                            )}
                            {role === 'delivery' && (
                                <>
                                    <li><Link to="/delivery" className="text-gray-600 dark:text-gray-400 hover:text-primary text-sm">Delivery Dashboard</Link></li>
                                    <li><Link to="/delivery/pickups" className="text-gray-600 dark:text-gray-400 hover:text-primary text-sm">Active Pickups</Link></li>
                                </>
                            )}
                            {role === 'admin' && (
                                <>
                                    <li><Link to="/admin" className="text-gray-600 dark:text-gray-400 hover:text-primary text-sm">Admin Panel</Link></li>
                                    <li><Link to="/admin/users" className="text-gray-600 dark:text-gray-400 hover:text-primary text-sm">Manage Users</Link></li>
                                    <li><Link to="/admin/sellers" className="text-gray-600 dark:text-gray-400 hover:text-primary text-sm">Manage Sellers</Link></li>
                                </>
                            )}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Support</h3>
                        <ul className="space-y-3">
                            {(!role || role === 'customer') && (
                                <>
                                    <li><Link to="/orders" className="text-gray-600 dark:text-gray-400 hover:text-primary text-sm">Track Order</Link></li>
                                    <li><Link to="/profile" className="text-gray-600 dark:text-gray-400 hover:text-primary text-sm">Account Settings</Link></li>
                                    <li><Link to="/policies" className="text-gray-600 dark:text-gray-400 hover:text-primary text-sm">Replacement Policy</Link></li>
                                </>
                            )}
                            {role === 'seller' && (
                                <li><Link to="/policies" className="text-gray-600 dark:text-gray-400 hover:text-primary text-sm">Seller Policies</Link></li>
                            )}
                            {role === 'delivery' && (
                                <li><Link to="/policies" className="text-gray-600 dark:text-gray-400 hover:text-primary text-sm">Delivery Guidelines</Link></li>
                            )}
                            {role === 'admin' && (
                                <li><Link to="/policies" className="text-gray-600 dark:text-gray-400 hover:text-primary text-sm">Platform Rules</Link></li>
                            )}
                            <li><Link to="/faq" className="text-gray-600 dark:text-gray-400 hover:text-primary text-sm">FAQs</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Contact Us</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 text-gray-600 dark:text-gray-400 text-sm">
                                <MapPin size={18} className="mt-0.5" />
                                <span>123 Fashion Street, Tech City,<br />Hyderabad, 500081</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm">
                                <Phone size={18} />
                                <span>+91 98765 43210</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm">
                                <Mail size={18} />
                                <span>support@quickstyle.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} QuickStyle. All rights reserved.
                    </p>
                    <div className="flex space-x-6 text-sm text-gray-500">
                        <Link to="/policies" className="hover:text-gray-900 dark:hover:text-white">Policies & Terms</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
