import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sun, Moon, LogOut, Menu, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { toggleTheme } from '../../redux/slices/uiSlice';
import { motion, AnimatePresence } from 'framer-motion';

// This layout will accept a Sidebar component as a prop to distinguish between Admin/Seller
const DashboardLayout = ({ Sidebar }) => {
    const dispatch = useDispatch();
    const { isDarkMode } = useSelector(state => state.ui);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden transition-colors duration-200">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar Area */}
            <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 flex-shrink-0 flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 transition-all duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}>
                {/* Mobile Close Button */}
                <div className="lg:hidden flex justify-end p-4">
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex-1 min-h-0 overflow-hidden">
                    <Sidebar />
                </div>

                {/* Shared Footer Actions in Sidebar */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Theme</span>
                        <button
                            onClick={() => dispatch(toggleTheme())}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            {!isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                        </button>
                    </div>
                    <button
                        onClick={() => dispatch(logout())}
                        className="flex w-full items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        <LogOut className="h-5 w-5 mr-3" />
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto flex flex-col">
                {/* Mobile Header */}
                <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                        QuickStyle
                    </h1>
                    <div className="w-10" /> {/* Spacer for centering */}
                </div>

                {/* Page Content */}
                <div className="flex-1 p-4 sm:p-6 lg:p-8 text-gray-900 dark:text-gray-100">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="h-full"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>

    );
};

export default DashboardLayout;
