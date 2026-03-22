import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../redux/slices/wishlistSlice';
import { Star, ShoppingCart, Heart, ChevronLeft, Truck, Shield, RotateCcw, X, Minus, Plus, Share2, ChevronRight, Clock } from 'lucide-react';
import { addRecentlyViewed } from '../../redux/slices/recentlyViewedSlice';
import { calculateETA, getDistanceFromLatLonInKm } from '../../utils/etaUtils';
import { toast } from 'react-toastify';
import ReviewsList from './ReviewsList';
import ProductCard from '../../components/customer/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { products, isLoading } = useSelector(state => state.products);
    const wishlist = useSelector(state => state.wishlist.items);
    const { userLocation } = useSelector(state => state.ui);

    const product = products.find(p => (p._id || p.id) === id);
    const isInWishlist = wishlist?.some(item => (item._id || item.id) === (product?._id || product?.id));

    const deliveryETA = React.useMemo(() => {
        if (!userLocation || !product?.shopId?.location?.coordinates) return "Fast Delivery";
        const [lng, lat] = product.shopId.location.coordinates;
        const dist = getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, lat, lng);
        return calculateETA(dist);
    }, [userLocation, product]);

    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState('M');
    const [selectedColor, setSelectedColor] = useState('Black');
    const [quantity, setQuantity] = useState(1);
    const [showSizeGuide, setShowSizeGuide] = useState(false);
    const [activeTab, setActiveTab] = useState('description');

    // Reset state when product ID changes
    useEffect(() => {
        setSelectedSize('M');
        setSelectedColor('Black');
        setQuantity(1);
        setSelectedImage(0);
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        if (!isLoading && !product) {
            toast.error('Product not found');
            navigate('/');
        } else if (product) {
            dispatch(addRecentlyViewed(product));
        }
    }, [product, isLoading, navigate, dispatch]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin dark:border-gray-800 dark:border-t-white"></div>
            </div>
        );
    }

    if (!product) return null;

    const productVariants = product.variants || [];
    const currentVariantImages = productVariants.find(v => v.color === selectedColor)?.images;
    const images = (currentVariantImages?.length > 0 ? currentVariantImages : null)
        || (product.images?.length > 0 ? product.images : null)
        || [product.image, product.image];
    const colors = productVariants.length > 0
        ? productVariants.map(v => v.color)
        : ['Black', 'White', 'Navy']; // Fallback

    // Get sizes for selected color
    const availableSizes = productVariants.find(v => v.color === selectedColor)?.sizes || [];
    const sizes = availableSizes.length > 0
        ? availableSizes.map(s => s.size)
        : ['S', 'M', 'L', 'XL']; // Fallback

    const handleAddToCart = () => {
        dispatch(addToCart({
            ...product,
            selectedSize,
            selectedColor,
            quantity
        }));
        toast.success(
            <div className="flex flex-col">
                <span className="font-bold">Added to Cart</span>
                <span className="text-sm">{product.name} ({selectedSize})</span>
            </div>
        );
    };

    const handleToggleWishlist = () => {
        if (isInWishlist) {
            dispatch(removeFromWishlist((product._id || product.id)));
            toast.info('Removed from wishlist');
        } else {
            dispatch(addToWishlist(product));
            toast.success('Added to wishlist');
        }
    };

    const [direction, setDirection] = useState(0);

    const imageVariants = {
        enter: (dir) => ({
            x: dir > 0 ? 1000 : -1000,
            opacity: 0
        }),
        center: { zIndex: 1, x: 0, opacity: 1 },
        exit: (dir) => ({
            zIndex: 0,
            x: dir < 0 ? 1000 : -1000,
            opacity: 0
        })
    };

    const swipeConfidenceThreshold = 100;
    const swipePower = (offset, velocity) => {
        return Math.abs(offset) * velocity;
    };

    const nextImage = () => {
        setDirection(1);
        setSelectedImage((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setDirection(-1);
        setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
            <Helmet>
                <title>{product.name} | QuickStyle</title>
                <meta name="description" content={`Buy ${product.name} at QuickStyle. ${product.category} collection with fast delivery. Price: ₹${product.price}`} />
            </Helmet>

            {/* Breadcrumb */}
            <nav className="border-b border-gray-100 dark:border-gray-800 sticky top-16 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center text-[10px] uppercase font-bold tracking-wider">
                    <Link to="/" className="text-gray-400 hover:text-black dark:hover:text-white transition-colors">Home</Link>
                    <ChevronRight className="h-3 w-3 mx-2 text-gray-300" />
                    <Link to={`/search?category=${product.category}`} className="text-gray-400 hover:text-black dark:hover:text-white transition-colors">{product.category}</Link>
                    <ChevronRight className="h-3 w-3 mx-2 text-gray-300" />
                    <span className="text-black dark:text-white truncate">{product.name}</span>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-2 lg:py-10">
                <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-start relative">

                    {/* Left Column: Image Gallery (Sticky) */}
                    <div className="flex flex-col-reverse lg:flex-row gap-4 lg:sticky lg:top-24 h-fit">
                        {/* Thumbnails - Desktop Only (Left Side) */}
                        <div className="hidden lg:flex flex-col gap-3 w-20 flex-shrink-0">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setDirection(idx > selectedImage ? 1 : -1);
                                        setSelectedImage(idx);
                                    }}
                                    className={`aspect-[3/4] rounded-lg overflow-hidden border transition-all ${selectedImage === idx
                                        ? 'border-black dark:border-white ring-1 ring-black dark:ring-white'
                                        : 'border-transparent opacity-70 hover:opacity-100'
                                        }`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>

                        {/* Main Image Area */}
                        <div className="relative flex-1 lg:max-w-xl mx-auto w-full">
                            <motion.div
                                className="aspect-[3/3] bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden relative group"
                            >
                                <AnimatePresence initial={false} custom={direction}>
                                    <motion.img
                                        key={selectedImage}
                                        src={images[selectedImage]}
                                        custom={direction}
                                        variants={imageVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{
                                            x: { type: "spring", stiffness: 300, damping: 30 },
                                            opacity: { duration: 0.2 }
                                        }}
                                        drag="x"
                                        dragConstraints={{ left: 0, right: 0 }}
                                        dragElastic={1}
                                        onDragEnd={(e, { offset, velocity }) => {
                                            const swipe = swipePower(offset.x, velocity.x);

                                            if (swipe < -swipeConfidenceThreshold) {
                                                nextImage();
                                            } else if (swipe > swipeConfidenceThreshold) {
                                                prevImage();
                                            }
                                        }}
                                        alt={product.name}
                                        className="w-full h-full object-cover absolute inset-0"
                                    />
                                </AnimatePresence>

                                {/* Badges */}
                                <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 pointer-events-none">
                                    {product.discount > 0 && (
                                        <div className="bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold px-2 py-1 uppercase tracking-widest w-fit">
                                            -{product.discount}%
                                        </div>
                                    )}
                                </div>

                                <button onClick={handleToggleWishlist} className="absolute top-3 right-3 z-10 p-2 bg-white/60 dark:bg-black/40 backdrop-blur-md rounded-full text-black dark:text-white hover:bg-white dark:hover:bg-gray-800 transition-colors">
                                    <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                                </button>

                                {/* Navigation Arrows (Visible on Hover for Desktop too) */}
                                <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                        className="p-2 bg-white/80 dark:bg-black/60 rounded-full shadow-md backdrop-blur-sm hover:bg-white dark:hover:bg-black transition-colors pointer-events-auto"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                        className="p-2 bg-white/80 dark:bg-black/60 rounded-full shadow-md backdrop-blur-sm hover:bg-white dark:hover:bg-black transition-colors pointer-events-auto"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </div>
                            </motion.div>

                            {/* Mobile Carousel Dots */}
                            <div className="flex lg:hidden justify-center items-center gap-2 mt-3">
                                {images.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`w-2 h-2 rounded-full transition-all ${selectedImage === idx
                                            ? 'bg-black dark:bg-white w-4'
                                            : 'bg-gray-300 dark:bg-gray-600'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Product Details */}
                    <div className="mt-4 lg:mt-0">
                        <div className="mb-4">
                            <h1 className="text-xl sm:text-3xl font-bold tracking-tight mb-0 text-gray-900 dark:text-white font-heading">
                                {product.name}
                            </h1>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-xl font-bold text-gray-900 dark:text-white">₹{product.price}</span>
                                {product.discount > 0 && (
                                    <>
                                        <span className="text-sm text-gray-400 line-through">
                                            ₹{Math.round(product.price * (1 + product.discount / 100))}
                                        </span>
                                        <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wide">
                                            {product.discount}% Off
                                        </span>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-2 mb-6">
                                <div className="flex bg-yellow-400 text-black px-1.5 py-0.5 rounded textxs font-bold items-center gap-1">
                                    <span className="text-xs">{product.rating}</span>
                                    <Star className="h-3 w-3 fill-current" />
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium underline decoration-gray-300 cursor-pointer">
                                    {product.reviews} Verification Ratings
                                </span>
                                <div className="ml-auto flex items-center gap-1.5 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-1 rounded">
                                    <Clock className="h-3 w-3" />
                                    {deliveryETA}
                                </div>
                            </div>
                        </div>

                        {/* Selectors */}
                        <div className="space-y-5 mb-4">
                            {/* Color Selector */}
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-gray-100 mb-2 block">
                                    Color: <span className="text-gray-500">{selectedColor}</span>
                                </span>
                                <div className="flex gap-2">
                                    {colors.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={`group relative w-5 h-5 rounded-full flex items-center justify-center transition-all ${selectedColor === color
                                                ? 'ring-1 ring-offset-2 ring-black dark:ring-white dark:ring-offset-gray-900 scale-110'
                                                : 'hover:scale-110'
                                                }`}
                                        >
                                            <div
                                                className="w-5 h-5 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm"
                                                style={{ backgroundColor: color === 'White' ? '#fff' : color.toLowerCase() }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Size Selector */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-gray-100">
                                        Size: <span className="text-gray-500">{selectedSize}</span>
                                    </span>
                                    <button
                                        onClick={() => setShowSizeGuide(true)}
                                        className="text-[10px] font-bold text-gray-500 underline hover:text-black dark:hover:text-white"
                                    >
                                        SIZE GUIDE
                                    </button>
                                </div>
                                <div className="grid grid-cols-6 gap-2">
                                    {sizes.map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`h-9 rounded-md font-bold text-xs transition-all border ${selectedSize === size
                                                ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-md'
                                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-black'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 mb-8">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleAddToCart}
                                className="flex-1 bg-black text-white dark:bg-white dark:text-black h-12 rounded-lg font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                            >
                                <ShoppingCart className="h-4 w-4" />
                                Add to Bag
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleToggleWishlist}
                                className={`w-12 h-12 shrink-0 rounded-lg border flex items-center justify-center transition-all ${isInWishlist
                                    ? 'border-red-500 bg-red-50 text-red-500 dark:bg-red-900/10'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-black dark:hover:border-white text-gray-600 dark:text-gray-300'
                                    }`}
                            >
                                <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: product.name,
                                            text: `Check out ${product.name} on QuickStyle!`,
                                            url: window.location.href,
                                        }).catch(console.error);
                                    } else {
                                        navigator.clipboard.writeText(window.location.href);
                                        toast.success('Link copied to clipboard!');
                                    }
                                }}
                                className="w-12 h-12 shrink-0 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:border-black dark:hover:border-white transition-all"
                            >
                                <Share2 className="h-5 w-5" />
                            </motion.button>
                        </div>

                        {/* Value Props - Smaller */}
                        <div className="grid grid-cols-3 gap-3 py-4 border-y border-gray-100 dark:border-gray-800">
                            {[
                                { icon: Truck, title: "Free Shipping", subtitle: "Orders > ₹999" },
                                { icon: Shield, title: "Secure", subtitle: "100% Protected" },
                                { icon: RotateCcw, title: "Returns", subtitle: "30 Days" }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col items-center text-center">
                                    <item.icon className="h-4 w-4 text-gray-900 dark:text-white mb-1" />
                                    <span className="text-[10px] font-bold uppercase tracking-wide text-gray-900 dark:text-white">{item.title}</span>
                                    <span className="text-[9px] text-gray-500">{item.subtitle}</span>
                                </div>
                            ))}
                        </div>

                        {/* Product Info */}
                        <div className="mt-6">
                            <h3 className="text-sm font-bold uppercase tracking-wider mb-2">Product Details</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                Elevate your style with the {product.name}. Carefully crafted for modern living, this piece combines
                                timeless design with premium materials.
                            </p>
                            <ul className="mt-4 space-y-1 text-xs text-gray-500 dark:text-gray-400 list-disc pl-4">
                                <li>Machine Wash</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Similar Products & Recommendations */}
                <div className="mt-6 space-y-6">
                    {/* Similar Products */}
                    <section>
                        <h3 className="text-xl font-bold font-heading mb-6 flex items-center gap-2">
                            Similar Products
                            <span className="text-gray-400 text-sm font-normal">Based on your selection</span>
                        </h3>
                        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                            {products
                                .filter(p => p.category === product.category && (p._id || p.id) !== (product._id || product.id))
                                .slice(0, 5)
                                .map(p => (
                                    <div key={(p._id || p.id)} className="min-w-[160px] md:min-w-[220px]">
                                        <ProductCard product={p} />
                                    </div>
                                ))}
                        </div>
                    </section>

                    {/* You Might Also Like */}
                    <section>
                        <h3 className="text-xl font-bold font-heading mb-6 flex items-center gap-2">
                            You Might Also Like
                            <span className="text-gray-400 text-sm font-normal">Complete the look</span>
                        </h3>
                        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                            {products
                                .filter(p => (p._id || p.id) !== (product._id || product.id) && p.category !== product.category)
                                .slice(0, 5)
                                .map(p => (
                                    <div key={(p._id || p.id)} className="min-w-[160px] md:min-w-[220px]">
                                        <ProductCard product={p} />
                                    </div>
                                ))}
                        </div>
                    </section>
                </div>

                {/* Reviews Section */}
                <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-2">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ratings & Reviews</h2>
                    <ReviewsList reviews={product.reviewsList} />
                </div>

                {/* Size Guide Modal */}
                {showSizeGuide && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white dark:bg-gray-800 rounded-xl max-w-sm w-full p-5 shadow-2xl relative"
                        >
                            <button
                                onClick={() => setShowSizeGuide(false)}
                                className="absolute top-3 right-3 text-gray-400 hover:text-black dark:hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <h3 className="text-lg font-bold mb-4 text-center">Size Guide</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-center">
                                    <thead className="bg-gray-50 dark:bg-gray-700 font-bold text-gray-500 dark:text-gray-300">
                                        <tr>
                                            <th className="px-2 py-2">Size</th>
                                            <th className="px-2 py-2">Chest</th>
                                            <th className="px-2 py-2">Waist</th>
                                            <th className="px-2 py-2">Length</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size, i) => (
                                            <tr key={size} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <td className="px-2 py-2 font-bold">{size}</td>
                                                <td className="px-2 py-2">{34 + (i * 2)}</td>
                                                <td className="px-2 py-2">{28 + (i * 2)}</td>
                                                <td className="px-2 py-2">{26 + i}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ProductDetail;
