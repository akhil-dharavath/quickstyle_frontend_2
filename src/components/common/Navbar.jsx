import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation, NavLink, useSearchParams } from 'react-router-dom';
import { ShoppingCart, User, Search, Heart, MapPin, X, Menu, ChevronRight, Package } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { setGender } from '../../redux/slices/uiSlice';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { items } = useSelector(state => state.cart);
    const { user } = useSelector(state => state.auth);
    const { addresses, selectedAddressId } = useSelector(state => state.address);
    const { gender } = useSelector(state => state.ui);

    const currentAddress = addresses.find(a => (a._id || a.id) === selectedAddressId);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const dropdownRef = useRef(null);
    const searchContainerRef = useRef(null);

    // Filter routes where Navbar Levels 2 & 3 should be HIDDEN
    const hideNavRoutes = ['/cart', '/checkout', '/login', '/register', '/admin', '/seller'];
    const shouldHideNav = hideNavRoutes.some(route => location.pathname.startsWith(route));

    // Suggestions Mock Data
    const suggestions = [
        "T-Shirt", "Shirt", "Jeans", "Jacket", "Hoodie",
        "Dress", "Top", "Skirt", "Shoes", "Sneakers"
    ].filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleSearchSubmit = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setShowSuggestions(false);
            e.target.blur();
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchQuery(suggestion);
        navigate(`/search?q=${encodeURIComponent(suggestion)}`);
        setShowSuggestions(false);
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Define sub-categories based on gender
    const menCategories = [
        "Shirts", "T-Shirts", "Jeans", "Pants", "Hoodies",
        "Sweatshirts", "Jackets", "Sweaters", "Coats",
        "Sportswear", "Footwear", "Accessories"
    ];

    const womenCategories = [
        "Tops", "Dresses", "Skirts", "Ethnic Wear",
        "Jeans", "Pants", "Hoodies", "Sweatshirts",
        "Jackets", "Sweaters", "Coats",
        "Sportswear", "Footwear", "Accessories"
    ];

    const kidsCategories = [
        "T-Shirts", "Shorts", "Jeans", "Dresses",
        "Ethnic Wear", "Sleepwear", "School Uniforms"
    ];

    const subCategories = gender === 'Women' ? womenCategories : (gender === 'Kids' ? kidsCategories : menCategories);
    const currentSubCategory = searchParams.get('subCategory');

    const getLink = (subCat) => {
        const params = new URLSearchParams();
        params.set('category', gender);
        params.set('subCategory', subCat);
        return `/search?${params.toString()}`;
    };


    return (
        <>
            {/* LEVEL 1: Top Bar (Logo, Address, Search, Icons) - ALWAYS STICKY */}
            <div className="sticky top-0 z-[100] bg-white dark:bg-gray-900 shadow-sm transition-all duration-300 border-b border-gray-100 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-2 md:px-4 sm:px-6 lg:px-8 h-18 md:h-16 flex items-center justify-between gap-2 md:gap-4">

                    {/* Left: Logo (Desktop) & Categories (Desktop) */}
                    <div className="flex items-center gap-4 lg:gap-8">
                        {/* Logo - Hidden on Mobile if search is focused? Or just small icon? */}
                        {/* User wants "logo inside searchbar" on mobile, so we might hide this exterior logo on mobile or keep it very minimal */}
                        <Link to="/" className="hidden md:flex flex-shrink-0 items-center gap-2 group">
                            <div className="w-8 h-8 bg-black dark:bg-white text-white dark:text-black rounded-lg flex items-center justify-center font-heading font-black text-xl tracking-tighter group-hover:rotate-12 transition-transform">
                                Q
                            </div>
                            <h1 className="hidden lg:block text-xl font-heading font-bold tracking-tight text-gray-900 dark:text-white group-hover:tracking-wide transition-all">
                                QuickStyle
                            </h1>
                        </Link>

                        {/* Desktop Categories (Beside Logo) */}
                        {(!user || user.role === 'customer') && (
                            <div className="hidden md:flex items-center gap-6">
                                {['Men', 'Women', 'Kids'].map((g) => (
                                    <button
                                        key={g}
                                        onClick={() => {
                                            dispatch(setGender(g));
                                            if (location.pathname !== '/') navigate('/');
                                        }}
                                        className={`text-sm font-bold uppercase tracking-wider transition-colors ${gender === g
                                            ? 'text-black dark:text-white'
                                            : 'text-gray-500 hover:text-black dark:hover:text-white'
                                            }`}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Middle: Search Bar (Responsive) */}
                    {(!user || user.role === 'customer') ? (
                        <div className="flex flex-1 max-w-xl mx-0 md:mx-4 relative" ref={searchContainerRef}>
                            <motion.div
                                className={`flex-1 flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg md:rounded-full px-2 py-2 md:py-2 transition-all`}
                            >
                                {/* Mobile Logo Inside Search */}
                                <Link to="/" className="md:hidden flex-shrink-0 mr-1">
                                    <div className="w-7 h-7 bg-black dark:bg-white text-white dark:text-black rounded-md flex items-center justify-center font-heading font-black text-lg tracking-tighter">
                                        Q
                                    </div>
                                </Link>

                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setShowSuggestions(true);
                                    }}
                                    onFocus={() => {
                                        setShowSuggestions(true);
                                    }}
                                    onKeyDown={handleSearchSubmit}
                                    className="w-full bg-transparent border-none ml-1 md:ml-3 text-gray-900 dark:text-white placeholder-gray-500 p-0 outline-hidden"
                                    placeholder="Search products..."
                                />
                            </motion.div>

                            {/* Suggestions Dropdown */}
                            <AnimatePresence>
                                {showSuggestions && searchQuery && suggestions.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50"
                                    >
                                        {suggestions.map((suggestion, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                                            >
                                                <Search className="h-3 w-3 text-gray-400" />
                                                <span className="font-medium text-gray-700 dark:text-gray-200">{suggestion}</span>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="flex flex-1 max-w-xl mx-0 md:mx-4 relative items-center justify-center lg:justify-start">
                            <Link to={`/${user.role === 'deliveryPerson' ? 'delivery' : user.role}`} className="px-5 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold text-sm tracking-wider hover:scale-105 transition-all">
                                Go to Dashboard
                            </Link>
                        </div>
                    )}

                    {/* Right: Icons */}
                    <div className="flex items-center gap-1 sm:gap-4">

                        {(!user || user.role === 'customer') && (
                            <>
                                <Link to="/wishlist" className="hidden md:flex items-center justify-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-all font-medium text-xs flex-col gap-0.5">
                                    <Heart className="h-5 w-5" />
                                </Link>

                                <Link to="/cart" className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-all relative group flex-col gap-0.5">
                                    <div className="relative">
                                        <ShoppingCart className="h-5 w-5 group-hover:fill-current" />
                                        {items.length > 0 && (
                                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                                {items.length}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            </>
                        )}

                        {/* Profile Dropdown */}
                        <div className="relative ml-1 hidden md:block" ref={dropdownRef}>
                            {user ? (
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-2 focus:outline-none"
                                >
                                    <img
                                        src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`}
                                        alt=""
                                        className="h-8 w-8 rounded-full bg-gray-200 ring-2 ring-transparent hover:ring-black dark:hover:ring-white transition-all object-cover"
                                    />
                                </button>
                            ) : (
                                <Link to="/login" className="ml-2 px-5 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider hover:shadow-lg hover:-translate-y-0.5 transition-all">
                                    Login
                                </Link>
                            )}

                            {/* Dropdown Menu */}
                            <AnimatePresence>
                                {isDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 w-60 mt-3 origin-top-right bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800 rounded-xl shadow-xl ring-1 ring-black/5 focus:outline-none overflow-hidden"
                                    >
                                        <div className="px-5 py-4 bg-gray-50 dark:bg-gray-800/50">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Signed in as</p>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate mt-1">{user?.email}</p>
                                        </div>
                                        <div className="py-1">
                                            {(!user || user.role === 'customer') ? (
                                                <>
                                                    <Link
                                                        to="/profile"
                                                        onClick={() => setIsDropdownOpen(false)}
                                                        className="group flex items-center px-5 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                                                    >
                                                        <User className="mr-3 h-4 w-4 text-gray-400 group-hover:text-black dark:group-hover:text-white" />
                                                        Your Profile
                                                    </Link>
                                                    <Link
                                                        to="/orders"
                                                        onClick={() => setIsDropdownOpen(false)}
                                                        className="group flex items-center px-5 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                                                    >
                                                        <Package className="mr-3 h-4 w-4 text-gray-400 group-hover:text-black dark:group-hover:text-white" />
                                                        Orders
                                                    </Link>
                                                </>
                                            ) : (
                                                <Link
                                                    to={`/${user.role === 'deliveryPerson' ? 'delivery' : user.role}`}
                                                    onClick={() => setIsDropdownOpen(false)}
                                                    className="group flex items-center px-5 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                                                >
                                                    <User className="mr-3 h-4 w-4 text-gray-400 group-hover:text-black dark:group-hover:text-white" />
                                                    Dashboard
                                                </Link>
                                            )}
                                            <button
                                                onClick={() => {
                                                    dispatch(logout());
                                                    setIsDropdownOpen(false);
                                                }}
                                                className="group w-full flex items-center px-5 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors font-bold"
                                            >
                                                Sign out
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* LEVEL 2: Mobile Categories - HIDDEN on Desktop, HIDDEN on Sticky Mode (it scrolls away), ONLY on Home */}
            {!shouldHideNav && location.pathname === '/' && (!user || user.role === 'customer') && (
                <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-center space-x-8 h-10">
                            {['Men', 'Women', 'Kids'].map((g) => (
                                <button
                                    key={g}
                                    onClick={() => {
                                        dispatch(setGender(g));
                                        if (location.pathname !== '/') navigate('/');
                                    }}
                                    style={{ paddingTop: '5px' }}
                                    className={`h-full border-b-2 text-xs font-bold uppercase tracking-wider px-2 transition-all ${gender === g
                                        ? 'border-black dark:border-white text-black dark:text-white'
                                        : 'border-transparent text-gray-500 hover:text-black dark:hover:text-white hover:border-gray-300'
                                        }`}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
