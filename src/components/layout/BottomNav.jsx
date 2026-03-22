import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid, ShoppingCart, User, Package, Heart } from 'lucide-react';
import { useSelector } from 'react-redux';

const BottomNav = () => {
    const { items } = useSelector(state => state.cart);

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 px-6 py-2 shadow-lg">
            <div className="flex justify-around items-center">
                <NavLink
                    to="/"
                    className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}
                >
                    <Home className="h-6 w-6" />
                    <span className="text-xs font-medium">Home</span>
                </NavLink>

                {/* We can map this to a categories page or just keep it as a placeholder/scroll to top for now. 
                    Let's use it as a Categories link if we had one, or just Search results? 
                    Let's link to /search?q=all or similar. For now, link to home with a category filter in mind? 
                    Actually, let's just make it "Categories" -> "/" for now as we don't have a dedicated categories page yet. 
                */}
                {/* <NavLink
                    to="/search"
                    className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}
                >
                    <Grid className="h-6 w-6" />
                    <span className="text-xs font-medium">Categories</span>
                </NavLink> */}

                <NavLink
                    to="/orders"
                    className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}
                >
                    <Package className="h-6 w-6" />
                    <span className="text-xs font-medium">Orders</span>
                </NavLink>

                {/* <NavLink
                    to="/cart"
                    className={({ isActive }) => `flex flex-col items-center gap-1 relative ${isActive ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}
                >
                    <div className="relative">
                        <ShoppingCart className="h-6 w-6" />
                        {items.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                {items.length}
                            </span>
                        )}
                    </div>
                    <span className="text-xs font-medium">Cart</span>
                </NavLink> */}

                <NavLink
                    to="/wishlist"
                    className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}
                >
                    <Heart className="h-6 w-6" />
                    <span className="text-xs font-medium">Wishlist</span>
                </NavLink>

                <NavLink
                    to="/profile"
                    className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}
                >
                    <User className="h-6 w-6" />
                    <span className="text-xs font-medium">Profile</span>
                </NavLink>
            </div>
        </div>
    );
};

export default BottomNav;
