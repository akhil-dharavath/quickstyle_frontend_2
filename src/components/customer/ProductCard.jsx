import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { addToCart } from '../../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../redux/slices/wishlistSlice';
import { Star, Clock, ShoppingBag, Heart } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { calculateETA, getDistanceFromLatLonInKm } from '../../utils/etaUtils';

const ProductCard = ({ product }) => {
    const dispatch = useDispatch();

    // Defensive selector
    const wishlistItems = useSelector(state => {
        return state.wishlist?.items || [];
    });
    
    const { userLocation } = useSelector(state => state.ui);

    const deliveryETA = React.useMemo(() => {
        if (!userLocation || !product.shopId?.location?.coordinates) return "Fast Delivery";
        const [lng, lat] = product.shopId.location.coordinates;
        const dist = getDistanceFromLatLonInKm(userLocation.lat, userLocation.lng, lat, lng);
        return calculateETA(dist);
    }, [userLocation, product]);

    const isInWishlist = React.useMemo(() => {
        return Array.isArray(wishlistItems) && wishlistItems.some(item => (item._id || item.id) === (product?._id || product?.id));
    }, [wishlistItems, product]);

    const handleAddToCart = () => {
        dispatch(addToCart({ 
            ...product, 
            quantity: 1,
            selectedSize: product.sizes?.[0] || 'Default',
            selectedColor: product.colors?.[0] || 'Default'
        }));
        toast.success(`${product.name} added to cart!`);
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

    if (!product) return null;

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="group relative bg-white dark:bg-gray-900 rounded-lg overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow"
        >
            <Link to={`/product/${(product._id || product.id)}`} className="block relative overflow-hidden rounded-lg aspect-[3/4] bg-gray-100 dark:bg-gray-800">
                <motion.img
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    src={product?.images[0]}
                    alt={product.name || 'Product Image'}
                    loading="lazy"
                    className="w-full h-full object-cover"
                />

                {/* Badges */}
                <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                    {product.discount > 0 && (
                        <span className="bg-white/90 dark:bg-black/90 backdrop-blur-md text-black dark:text-white text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider rounded-sm shadow-sm">
                            -{product.discount}%
                        </span>
                    )}
                </div>

                <div className="absolute bottom-2 left-2 right-2 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            handleAddToCart();
                        }}
                        className="w-full bg-white text-black py-2 rounded-md font-bold text-[10px] md:text-xs shadow-lg hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-1 uppercase tracking-wide"
                    >
                        <ShoppingBag className="h-3 w-3" />
                        Add
                    </button>
                </div>

                <button
                    onClick={(e) => {
                        e.preventDefault();
                        handleToggleWishlist();
                    }}
                    className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm text-gray-700 dark:text-white hover:bg-white hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                    <Heart className={`h-3 w-3 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
            </Link>

            <div className="py-2.5 px-1 md:p-3">
                <div className="flex justify-between items-start mb-0.5">
                    <h3 className="text-gray-900 dark:text-white font-bold text-[10px] md:text-xs truncate pr-1 flex-1 font-heading tracking-wide">
                        <Link to={`/product/${(product._id || product.id)}`}>
                            {product.name}
                        </Link>
                    </h3>
                    <div className="flex items-center gap-0.5 text-[9px] md:text-[10px] font-medium text-gray-500 dark:text-gray-400">
                        <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                        {product.rating}
                    </div>
                </div>

                <div className="flex items-center justify-between mb-1">
                    <p className="text-[9px] md:text-[10px] text-gray-500 dark:text-gray-400 truncate">{product.category}</p>
                    <div className="flex items-center gap-1 text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded shrink-0">
                        <Clock className="h-2 w-2" />
                        {deliveryETA}
                    </div>
                </div>

                <div className="flex items-baseline gap-1.5">
                    <span className="text-xs md:text-sm font-bold text-gray-900 dark:text-white font-heading">₹{product.price}</span>
                    <span className="text-[9px] md:text-[10px] text-gray-400 line-through">₹{Math.round(product.price * (1 + product.discount / 100))}</span>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
