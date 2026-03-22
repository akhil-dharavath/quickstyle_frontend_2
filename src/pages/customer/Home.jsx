import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../redux/slices/productSlice';
import { setUserLocation } from '../../redux/slices/uiSlice';
import ProductCard from '../../components/customer/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

import React, { useEffect, useState, useMemo } from 'react';
import { fetchSellers } from '../../redux/slices/sellerSlice';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, TrendingUp, Sparkles, Tag } from 'lucide-react';
import Skeleton from '../../components/common/Skeleton';

const ProductRow = ({ title, items, idx, onExplore }) => {
    const rowRef = React.useRef(null);

    const scroll = (direction) => {
        if (rowRef.current) {
            const { current } = rowRef;
            const scrollAmount = direction === 'left' ? -350 : 350;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (items.length === 0) return null;

    return (
        <section className="mb-4 md:mb-12 relative group/row">
            <div className="flex items-end justify-between mb-2 md:mb-6">
                <div>
                    <h2 className="text-lg md:text-2xl font-heading font-bold text-gray-900 dark:text-white mb-1 tracking-tight">
                        {title}
                    </h2>
                    <div className="h-1 w-20 bg-black dark:bg-white rounded-full"></div>
                </div>

                <button
                    onClick={onExplore}
                    className="group flex items-center gap-2 text-xs md:text-sm font-bold text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                >
                    View Collection
                    <span className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                        <ArrowRight className="h-4 w-4" />
                    </span>
                </button>
            </div>

            <div className="relative">
                {/* Scroll Buttons */}
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-4 bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-full shadow-2xl opacity-0 group-hover/row:opacity-100 transition-all duration-300 -ml-6 border border-gray-100 dark:border-gray-800 hidden lg:flex hover:scale-110"
                >
                    <ChevronLeft className="h-6 w-6 text-gray-900 dark:text-white" />
                </button>

                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-4 bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-full shadow-2xl opacity-0 group-hover/row:opacity-100 transition-all duration-300 -mr-6 border border-gray-100 dark:border-gray-800 hidden lg:flex hover:scale-110"
                >
                    <ChevronRight className="h-6 w-6 text-gray-900 dark:text-white" />
                </button>

                <div
                    ref={rowRef}
                    className="flex gap-3 md:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide px-4 lg:mx-0 lg:px-0 scroll-smooth"
                >
                    {items.map((product, i) => (
                        <div key={(product._id || product.id)} className="snap-start shrink-0 w-32 sm:w-48">
                            <ProductCard product={product} />
                        </div>
                    ))}

                    {/* "See All" Card */}
                    <div className="snap-start shrink-0 w-32 sm:w-48 lg:w-64 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-black dark:hover:border-white transition-colors cursor-pointer group/card" onClick={onExplore}>
                        <div className="p-4 rounded-full bg-white dark:bg-gray-800 shadow-sm mb-4 group-hover/card:scale-110 transition-transform">
                            <ArrowRight className="h-8 w-8 text-gray-400 group-hover/card:text-black dark:group-hover/card:text-white" />
                        </div>
                        <span className="font-heading font-bold text-gray-900 dark:text-white">View All</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

const Home = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { products, isLoading: productsLoading } = useSelector(state => state.products);
    const { sellers, isLoading: sellersLoading } = useSelector(state => state.sellers);
    const { gender, userLocation } = useSelector(state => state.ui);
    const { items: recentlyViewedItems } = useSelector(state => state.recentlyViewed);

    const nearbySellers = sellers; // The backend now filters based on location!
    const [currentSlide, setCurrentSlide] = useState(0);

    const menSlides = [
        {
            id: 1,
            image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=2070",
            title: "Men's Season",
            subtitle: "Redefine your style with our latest collection.",
            cta: "Shop Men"
        },
        {
            id: 2,
            image: "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?q=80&w=2070",
            title: "Urban Explorer",
            subtitle: "Versatile pieces for the modern man.",
            cta: "Explore"
        }
    ];

    const womenSlides = [
        {
            id: 1,
            image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070",
            title: "Summer Luxe",
            subtitle: "Effortless elegance for the warmer days.",
            cta: "Shop Women"
        },
        {
            id: 2,
            image: "https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?q=80&w=2070",
            title: "Modern Chic",
            subtitle: "Sophisticated styles for every occasion.",
            cta: "View All"
        }
    ];

    const kidsSlides = [
        {
            id: 1,
            image: "https://images.unsplash.com/photo-1471286174890-9c808743015a?q=80&w=2070",
            title: "Playful Vibes",
            subtitle: "Comfortable and trendy outfits for kids.",
            cta: "Shop Kids"
        },
        {
            id: 2,
            image: "https://images.unsplash.com/photo-1519238806101-3da987114cdd?q=80&w=2070",
            title: "Little Adventures",
            subtitle: "Durable wear for their daily fun.",
            cta: "Discover"
        }
    ];

    const defaultSlides = [
        {
            id: 1,
            image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070",
            title: "New Arrivals",
            subtitle: "Discover the latest trends in fashion.",
            cta: "Shop Now"
        },
        {
            id: 2,
            image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071",
            title: "Winter Edit",
            subtitle: "Cozy layers meets contemporary silhouette.",
            cta: "Explore"
        }
    ];

    const heroSlides = useMemo(() => {
        if (gender === 'Men') return menSlides;
        if (gender === 'Women') return womenSlides;
        if (gender === 'Kids') return kidsSlides;
        return defaultSlides;
    }, [gender]);

    useEffect(() => {
        // Redux userLocation will be populated by MainLayout
        if (userLocation) {
            const locationParams = { lat: userLocation.lat, lng: userLocation.lng, distance: 15 };
            dispatch(fetchProducts(locationParams));
            dispatch(fetchSellers(locationParams)); // Ensure sellers also filters if API supports
        }
    }, [dispatch, userLocation]);

    // Filter Sellers within 15km Radius is now natively done by the backend!
    useEffect(() => {
        // Just empty binding since setNearbySellers is removed
    }, [sellers, userLocation]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [heroSlides.length]);

    // const availableProducts = useMemo(() => {
    //     if (nearbySellers.length === 0 || !products.length) return [];
    //     // Map all nearby seller IDs
    //     const nearbySellerIds = nearbySellers.map(s => (s._id || s.id));

    //     let filtered = products.filter(p => nearbySellerIds.includes(p.sellerId));
    //     if (gender && gender !== 'All') filtered = filtered.filter(p => p.category === gender);

    //     console.log("Available Products for nearby sellers:", filtered.length, "Total Products:", products.length);
    //     return filtered;
    // }, [products, nearbySellers, gender]);
    const availableProducts = useMemo(() => {
        if (nearbySellers.length === 0 || !products.length) return [];

        const nearbySellerIds = nearbySellers.map(s => s._id);

        let filtered = products.filter(p =>
            nearbySellerIds.includes(p.shopId?._id)
        );

        if (gender && gender !== 'All') {
            filtered = filtered.filter(p => p.category === gender);
        }

        return filtered;
    }, [products, nearbySellers, gender]);

    const sections = useMemo(() => {
        const getTop = (fn) => availableProducts.filter(fn).slice(0, 8);

        // Common filtered sections
        const under399 = getTop(p => p.price <= 399);
        const bestSellers = getTop(p => p.rating >= 4.5);
        const fiftyPercentOff = getTop(p => p.discount >= 50);

        if (gender === 'Men') {
            return [
                { title: 'New Arrivals', items: getTop(p => true), link: '/search?category=Men&sort=newest' },
                { title: 'Under ₹399', items: under399, link: '/search?category=Men&price=0-500' },
                { title: 'Streetwear', items: getTop(p => p.subCategory === 'Hoodies' || p.subCategory === 'T-Shirts'), link: '/search?category=Men&subCategory=Hoodies,T-Shirts' },
                { title: 'Office Edit', items: getTop(p => p.subCategory === 'Shirts' || p.subCategory === 'Pants'), link: '/search?category=Men&subCategory=Shirts,Pants' },
                { title: 'Best Sellers', items: bestSellers, link: '/search?category=Men&sort=rating' },
            ];
        } else if (gender === 'Women') {
            return [
                { title: 'Trending Now', items: getTop(p => true), link: '/search?category=Women&sort=relevance' },
                { title: 'Min 50% Off', items: fiftyPercentOff, link: '/search?category=Women' },
                { title: 'Ethnic Grace', items: getTop(p => p.subCategory === 'Ethnic Wear'), link: '/search?category=Women&subCategory=Ethnic Wear' },
                { title: 'Casual Chic', items: getTop(p => p.subCategory === 'Tops' || p.subCategory === 'Jeans'), link: '/search?category=Women&subCategory=Tops,Jeans' },
                { title: 'Best Sellers', items: bestSellers, link: '/search?category=Women&sort=rating' },
            ];
        } else if (gender === 'Kids') {
            return [
                { title: 'New for Kids', items: getTop(p => true), link: '/search?category=Kids&sort=newest' },
                { title: 'Under ₹399', items: under399, link: '/search?category=Kids&price=0-500' },
                { title: 'Playtime', items: getTop(p => p.subCategory === 'T-Shirts' || p.subCategory === 'Shorts'), link: '/search?category=Kids&subCategory=T-Shirts,Shorts' },
                { title: 'Party Wear', items: getTop(p => p.subCategory === 'Dresses' || p.subCategory === 'Ethnic Wear'), link: '/search?category=Kids&subCategory=Dresses,Ethnic Wear' },
            ];
        }

        return [
            { title: 'Trending Now', items: getTop(p => true), link: '/search?sort=relevance' },
            { title: 'Under ₹399', items: getTop(p => p.price <= 399), link: '/search?price=0-500' },
            { title: 'Men\'s Collection', items: getTop(p => p.category === 'Men'), link: '/search?category=Men' },
            { title: 'Women\'s Collection', items: getTop(p => p.category === 'Women'), link: '/search?category=Women' },
            { title: 'Kids\' Collection', items: getTop(p => p.category === 'Kids'), link: '/search?category=Kids' },
        ];
    }, [availableProducts, gender]);

    const featuredCategories = useMemo(() => {
        if (gender === 'Men') {
            return [
                { name: "Shirts", image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=300" },
                { name: "T-Shirts", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=300" },
                { name: "Pants", image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=300" },
                // { name: "Footwear", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=300" },
            ];
        } else if (gender === 'Women') {
            return [
                { name: "Tops", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=300" },
                { name: "Kurti", image: "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?q=80&w=300" },
                { name: "Jeans", image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=300" },
            ];
        } else {
            return [
                { name: "T-Shirts", image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=80&w=300" },
                { name: "Shorts", image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=300" },
                { name: "Dresses", image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=300" },
            ];
        }
    }, [gender]);

    if (productsLoading || sellersLoading) {
        return <div className="min-h-screen pt-20 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-black"></div></div>;
    }

    return (
        <div>
            <Helmet>
                <title>QuickStyle | Hyperlocal Fashion Delivery</title>
                <meta name="description" content="Shop the latest trends from local fashion boutiques. Get clothes, shoes, and accessories delivered in hours." />
            </Helmet>

            {/* Immersive Hero */}
            {/* <div className="relative w-full h-[40vh] md:h-[50vh] -mt-0 mb-8 overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent z-10" />
                        <img
                            src={heroSlides[currentSlide]?.image || defaultSlides[0].image}
                            alt="Hero"
                            className="w-full h-full object-cover object-center"
                        />
                        <div className="absolute inset-0 flex items-center z-20">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                                <div className="max-w-xl">
                                    <motion.span
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="inline-block px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white text-xs font-bold uppercase tracking-widest mb-4"
                                    >
                                        Season Collection 2024
                                    </motion.span>
                                    <motion.h1
                                        initial={{ y: 30, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="text-4xl md:text-6xl font-heading font-black text-white leading-none mb-4"
                                    >
                                        {heroSlides[currentSlide]?.title}
                                    </motion.h1>
                                    <motion.p
                                        initial={{ y: 30, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.7 }}
                                        className="text-base md:text-lg text-gray-200 mb-6 font-light"
                                    >
                                        {heroSlides[currentSlide]?.subtitle}
                                    </motion.p>
                                    <motion.button
                                        initial={{ y: 30, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.9 }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => navigate('/search')}
                                        className="px-8 py-3 bg-white text-black rounded-full font-bold text-sm uppercase tracking-wider hover:bg-gray-100 transition-colors shadow-2xl"
                                    >
                                        {heroSlides[currentSlide]?.cta}
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                    {heroSlides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentSlide(i)}
                            className={`h-1.5 rounded-full transition-all duration-500 ${currentSlide === i ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}`}
                        />
                    ))}
                </div>
            </div> */}

            <div className="max-w-7xl mx-auto px-2 sm:px-8 lg:px-12">

                {/* Circular Categories (Myntra Style) */}
                <div className="mb-2 mt-2 md:mb-10 md:mt-6">
                    <h3 className="hidden md:block text-xl font-heading font-bold mb-6 text-gray-900 dark:text-white">Shop by Category</h3>
                    <div className="flex gap-2 md:gap-8 overflow-x-auto pb-4 scrollbar-hide justify-start md:justify-center">
                        {featuredCategories.map((cat, i) => (
                            <div key={i} className="flex flex-col items-center gap-1 md:gap-3 shrink-0 cursor-pointer group" onClick={() => navigate(`/search?category=${gender === 'All' ? 'All' : gender}&subCategory=${cat.name}`)}>
                                <div className="w-16 h-16 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-transparent group-hover:border-black dark:group-hover:border-white transition-all p-1">
                                    <div className="w-full h-full rounded-full overflow-hidden relative">
                                        {cat.image ? (
                                            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <div className={`w-full h-full flex items-center justify-center ${cat.color} bg-opacity-20`}>
                                                <cat.icon className="h-6 w-6 md:h-10 md:w-10" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <span className="text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors">{cat.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Location/Empty State Banner */}
                {userLocation && nearbySellers.length === 0 && !productsLoading && !sellersLoading && (
                    <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 mb-8 mt-4 mx-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Stores Nearby</h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                            We couldn't find any QuickStyle partner stores within 15km of your current location. We are expanding rapidly, check back soon!
                        </p>
                    </div>
                )}

                {/* Product Sections */}
                {nearbySellers.length > 0 && sections.map(({ title, items, link }, idx) => (
                    <ProductRow
                        key={title}
                        title={title}
                        items={items}
                        idx={idx}
                        onExplore={() => navigate(link)}
                    />
                ))}

                {/* Recently Viewed */}
                {recentlyViewedItems?.length > 0 && (
                    <ProductRow
                        title="Recently Viewed"
                        items={recentlyViewedItems}
                        idx={99}
                        onExplore={() => navigate('/search')}
                    />
                )}

            </div>
        </div>
    );
};

export default Home;
