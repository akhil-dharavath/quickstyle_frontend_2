import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, User, Store } from 'lucide-react';

const SellerSidebar = () => {
    const navItems = [
        { path: '/seller', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { path: '/seller/shop', icon: Store, label: 'Shop Profile' },
        { path: '/seller/products', icon: Package, label: 'My Products' },
        { path: '/seller/orders', icon: ShoppingCart, label: 'My Orders' },
        { path: '/seller/profile', icon: User, label: 'Profile' },
    ];

    return (
        <div className="flex flex-col h-full">
            <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-xl font-bold text-secondary">Seller Panel</h1>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.end}
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                ? 'bg-secondary/10 text-secondary dark:bg-secondary/20 dark:text-pink-400'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`
                        }
                    >
                        <item.icon className="h-5 w-5 mr-3" />
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default SellerSidebar;
