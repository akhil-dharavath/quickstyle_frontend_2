import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingBag, ShoppingCart, Map, Truck, Store } from 'lucide-react';

const AdminSidebar = () => {
    const navItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { path: '/admin/users', icon: Users, label: 'Users' },
        { path: '/admin/sellers', icon: Store, label: 'Sellers' },
        { path: '/admin/delivery-persons', icon: Truck, label: 'Delivery Persons' },
        { path: '/admin/products', icon: ShoppingBag, label: 'Products' },
        { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
        { path: '/admin/tracking', icon: Map, label: 'Live Tracking' },
    ];

    return (
        <div className="flex flex-col h-full">
            <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-xl font-bold text-primary">QuickStyle Admin</h1>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.end}
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-indigo-400'
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

export default AdminSidebar;
