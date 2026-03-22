import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../redux/slices/productSlice';
import ProductCard from '../../components/customer/ProductCard';
import { Search, Filter, ArrowUpDown, X, ChevronDown, ChevronRight, Check, ArrowRight, ChevronLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

// Reusing ProductRow from Home for consistency
const ProductRow = ({ title, items, onExplore }) => {
    const rowRef = React.useRef(null);

    const scroll = (direction) => {
        if (rowRef.current) {
            const { current } = rowRef;
            const scrollAmount = direction === 'left' ? -350 : 350;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (!items || items.length === 0) return null;

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
                    {items.map((product) => (
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

const FilterSection = ({ title, children, isOpen, setIsOpen }) => (
    <div className="border-b border-gray-200 dark:border-gray-700 py-4">
        <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between w-full text-left mb-2 group"
        >
            <span className="font-heading font-bold text-gray-900 dark:text-gray-100 group-hover:text-black dark:group-hover:text-white">{title}</span>
            {isOpen ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
        </button>
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                >
                    <div className="pt-2 space-y-2">
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

const SearchResults = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { products, isLoading } = useSelector(state => state.products);
    const { userLocation } = useSelector(state => state.ui);

    // URL Params
    const query = searchParams.get('q') || '';
    const categoryParam = searchParams.get('category') || 'All';
    const subCategoryParam = searchParams.get('subCategory');
    const priceParam = searchParams.get('price');
    const sortParam = searchParams.get('sort');
    const patternParam = searchParams.get('pattern');

    // Local State
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [sortBy, setSortBy] = useState('relevance');

    // Filter States - ALL SINGLE SELECT
    const [priceRange, setPriceRange] = useState('');
    const [selectedPattern, setSelectedPattern] = useState('');
    const [selectedSubCategory, setSelectedSubCategory] = useState('');

    // Initialize filters from URL
    useEffect(() => {
        if (subCategoryParam) {
            setSelectedSubCategory(subCategoryParam);
        } else {
            setSelectedSubCategory('');
        }

        if (priceParam) {
            setPriceRange(priceParam);
        } else {
            setPriceRange('');
        }

        if (patternParam) {
            setSelectedPattern(patternParam);
        } else {
            setSelectedPattern('');
        }

        if (sortParam) {
            setSortBy(sortParam);
        }
    }, [subCategoryParam, priceParam, patternParam, sortParam]);

    // Collapsible Sections State
    const [sectionsOpen, setSectionsOpen] = useState({
        category: true,
        price: true,
        pattern: true
    });

    const toggleSection = (section) => {
        setSectionsOpen(prev => ({ ...prev, [section]: !prev[section] }));
    };

    useEffect(() => {
        if (products.length === 0 && userLocation) {
            const locationParams = { lat: userLocation.lat, lng: userLocation.lng, distance: 15 };
            dispatch(fetchProducts(locationParams));
        }
    }, [dispatch, products.length, userLocation]);

    // Handle Category Filter Change
    const handleCategoryClick = (cat) => {
        const newParams = new URLSearchParams(searchParams);
        if (cat === 'All') {
            newParams.delete('category');
        } else {
            newParams.set('category', cat);
        }
        // Reset other filters when switching main category
        newParams.delete('subCategory');
        newParams.delete('pattern');
        newParams.delete('price');
        setSearchParams(newParams);

        setSelectedSubCategory('');
        setSelectedPattern('');
        setPriceRange('');
    };

    // Derived Data for Filters and Browsing
    const categories = ['All', 'Men', 'Women', 'Kids'];

    // Filter functions
    const filterProducts = (prods) => {
        let results = prods;

        // 1. Text Search
        if (query) {
            const lowerQuery = query.toLowerCase();
            results = results.filter(p =>
                p.name.toLowerCase().includes(lowerQuery) ||
                p.category.toLowerCase().includes(lowerQuery) ||
                p.subCategory?.toLowerCase().includes(lowerQuery)
            );
        }

        // 2. Main Category Filter
        if (categoryParam !== 'All') {
            results = results.filter(p => p.category === categoryParam);
        }

        // 3. Sub-Category Filter (Single)
        if (selectedSubCategory) {
            results = results.filter(p => p.subCategory === selectedSubCategory);
        }

        // 4. Pattern Filter (Single)
        if (selectedPattern) {
            results = results.filter(p => p.pattern === selectedPattern);
        }

        // 5. Price Filter (Single)
        if (priceRange) {
            const [min, max] = priceRange.split('-').map(Number);
            results = results.filter(p => {
                if (max) return p.price >= min && p.price <= max;
                return p.price >= min;
            });
        }

        return results;
    }

    const filteredProducts = useMemo(() => {
        let results = filterProducts(products);

        // 6. Sorting
        return [...results].sort((a, b) => {
            switch (sortBy) {
                case 'price-low': return a.price - b.price;
                case 'price-high': return b.price - a.price;
                case 'newest': return (b._id || b.id).localeCompare((a._id || a.id));
                case 'rating': return b.rating - a.rating;
                case 'relevance':
                default:
                    return (b.rating * Math.log(b.reviews + 1)) - (a.rating * Math.log(a.reviews + 1));
            }
        });
    }, [products, query, categoryParam, selectedSubCategory, selectedPattern, priceRange, sortBy]);

    const availableSubCategories = useMemo(() => [...new Set(products.filter(p => categoryParam === 'All' || p.category === categoryParam).map(p => p.subCategory).filter(Boolean))], [products, categoryParam]);
    const availablePatterns = useMemo(() => [...new Set(products.filter(p => categoryParam === 'All' || p.category === categoryParam).map(p => p.pattern).filter(Boolean))], [products, categoryParam]);

    // Check if we are in "Browsing Mode" (Only Category selected, no specific filters)
    const isBrowsingMode = !query && !selectedSubCategory && !selectedPattern && !priceRange;

    // Check if SubCategory Mode (Only Category & SubCategory selected)
    const isSubCategoryMode = !query && selectedSubCategory && !selectedPattern && !priceRange;

    // Generate Attribute Sections for Browsing Mode
    const attributeSections = useMemo(() => {
        if (!isBrowsingMode && !isSubCategoryMode) return [];

        const baseProducts = products.filter(p => categoryParam === 'All' || p.category === categoryParam);
        const sections = [];

        // Helper to create sections
        const addSection = (title, filterFn, linkParams) => {
            const items = baseProducts.filter(filterFn).slice(0, 8);
            if (items.length >= 4) { // Only show populated sections
                const link = `/search?category=${categoryParam}&${linkParams}`;
                sections.push({ title, items, link });
            }
        };

        if (isSubCategoryMode) {
            // Group by Pattern for SubCategory Mode
            const subCatProducts = baseProducts.filter(p => p.subCategory === selectedSubCategory);

            // Get Counts of each pattern
            const patternCounts = {};
            subCatProducts.forEach(p => {
                if (p.pattern) {
                    patternCounts[p.pattern] = (patternCounts[p.pattern] || 0) + 1;
                }
            });

            // Sort Patterns by Count
            const sortedPatterns = Object.keys(patternCounts).sort((a, b) => patternCounts[b] - patternCounts[a]);

            // Take top 4
            const topPatterns = sortedPatterns.slice(0, 4);

            topPatterns.forEach(pat => {
                const patItems = subCatProducts.filter(p => p.pattern === pat).slice(0, 8);
                // For subcategory sections, we might be more lenient with content count
                if (patItems.length > 0) {
                    sections.push({
                        title: `${pat} ${selectedSubCategory || 'Items'}`,
                        items: patItems,
                        link: `/search?category=${categoryParam}&subCategory=${selectedSubCategory}&pattern=${pat}`
                    });
                }
            });

        } else {
            // Define Attribute-based sections dynamically for Browsing Mode
            // Pattern Sections
            ['Checked', 'Printed', 'Solid', 'Striped'].forEach(pat => {
                addSection(`${pat} Collection`, p => p.pattern === pat, `pattern=${pat}`);
            });

            // Occasion Sections
            ['Party', 'Formal', 'Beach', 'Casual'].forEach(occ => {
                addSection(`${occ} Wear`, p => p.occasion === occ, `q=${occ}`);
            });

            // Fit Sections
            ['Oversized', 'Slim'].forEach(fit => {
                addSection(`${fit} Fit`, p => p.fit === fit, `q=${fit}`);
            });
        }

        return sections;

    }, [products, categoryParam, isBrowsingMode, isSubCategoryMode, selectedSubCategory]);


    // Simplified Handler: Only supports setting logic, toggle handled in UI call if needed
    // But for Radio, usually clicking selected doesn't untoggle, but user requested toggle-like behavior?
    // "Single Select" usually means clicking another replaces. Clicking same might do nothing or untoggle.
    // Let's implement "Clicking same untoggles" for better UX so they can clear filter easily without "Clear All"
    const handleSingleSelect = (state, setState, value, paramKey) => {
        let newValue = value;
        if (state === value) {
            newValue = ''; // Toggle off
        }

        setState(newValue);

        // Sync with URL immediately
        const newParams = new URLSearchParams(searchParams);
        if (newValue) {
            newParams.set(paramKey, newValue);
        } else {
            newParams.delete(paramKey);
        }
        setSearchParams(newParams);
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 pt-4 pb-4">
            <Helmet>
                <title>{categoryParam === 'All' ? 'Search Products' : `${categoryParam} Fashion`} | QuickStyle</title>
                <meta name="description" content={`Browse ${filteredProducts.length} results for ${query || categoryParam} fashion and clothing.`} />
            </Helmet>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header & Mobile Filter Toggle */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                    <div>
                        <h1 className="text-3xl font-heading font-black text-gray-900 dark:text-white tracking-tight">
                            {categoryParam === 'All' ? 'All Products' : `${categoryParam}'s Collection`}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            {filteredProducts.length} results found
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileFilterOpen(true)}
                            className="md:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-bold"
                        >
                            <Filter className="h-4 w-4" /> Filters
                        </button>

                        <div className="flex items-center gap-2">
                            {!isBrowsingMode && !isSubCategoryMode && (
                                <>
                                    <span className="text-sm text-gray-500 hidden md:block">Sort by:</span>
                                    <div className="relative group">
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="appearance-none bg-transparent font-bold text-gray-900 dark:text-white pr-8 focus:outline-none cursor-pointer"
                                            style={{ textAlignLast: 'center' }}
                                        >
                                            <option value="relevance">Relevance</option>
                                            <option value="price-low">Price: Low to High</option>
                                            <option value="price-high">Price: High to Low</option>
                                            <option value="newest">Newest First</option>
                                            <option value="rating">Top Rated</option>
                                        </select>
                                        <ArrowUpDown className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none group-hover:text-black dark:group-hover:text-white transition-colors" />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-8 items-start">

                    {/* Sidebar / Desktop Filters */}
                    <div className={`
                        fixed inset-0 z-50 bg-white dark:bg-gray-900 p-6 overflow-y-auto transition-transform duration-300 transform
                        md:sticky md:top-24 md:h-[calc(100vh-8rem)] md:inset-auto md:bg-transparent md:p-0 md:translate-x-0 md:w-64 md:block md:overflow-y-auto md:z-auto
                        ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    `}>
                        <div className="flex items-center justify-between md:hidden mb-6">
                            <span className="text-xl font-black font-heading">Filters</span>
                            <button onClick={() => setIsMobileFilterOpen(false)}>
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Category Filter */}
                        <FilterSection title="Category" isOpen={sectionsOpen.category} setIsOpen={() => toggleSection('category')}>
                            {categories.map(cat => (
                                <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${categoryParam === cat ? 'border-black bg-black dark:border-white dark:bg-white' : 'border-gray-300 dark:border-gray-600'}`}>
                                        {categoryParam === cat && <div className="w-2 h-2 rounded-full bg-white dark:bg-black" />}
                                    </div>
                                    <input
                                        type="radio"
                                        name="category"
                                        className="hidden"
                                        checked={categoryParam === cat}
                                        onChange={() => handleCategoryClick(cat)}
                                    />
                                    <span className={`text-sm ${categoryParam === cat ? 'font-bold text-black dark:text-white' : 'text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white'}`}>
                                        {cat}
                                    </span>
                                </label>
                            ))}
                        </FilterSection>

                        {/* SubCategory Filter - CHANGED TO RADIO */}
                        {availableSubCategories.length > 0 && (
                            <FilterSection title="Type" isOpen={true} setIsOpen={() => { }}>
                                {availableSubCategories.map(sub => (
                                    <label key={sub} className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${selectedSubCategory === sub ? 'border-black bg-black dark:border-white dark:bg-white' : 'border-gray-300 dark:border-gray-600'}`}>
                                            {selectedSubCategory === sub && <div className="w-2 h-2 rounded-full bg-white dark:bg-black" />}
                                        </div>
                                        <input
                                            type="radio"
                                            name="subCategory"
                                            className="hidden"
                                            onChange={() => handleSingleSelect(selectedSubCategory, setSelectedSubCategory, sub, 'subCategory')}
                                            checked={selectedSubCategory === sub}
                                        />
                                        <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white">{sub}</span>
                                    </label>
                                ))}
                            </FilterSection>
                        )}

                        {/* Price Filter - Single Select (Radio) */}
                        <FilterSection title="Price" isOpen={sectionsOpen.price} setIsOpen={() => toggleSection('price')}>
                            {[
                                { label: 'Under ₹500', value: '0-500' },
                                { label: '₹500 - ₹1000', value: '500-1000' },
                                { label: '₹1000 - ₹2000', value: '1000-2000' },
                                { label: '₹2000 - ₹3000', value: '2000-3000' },
                                { label: 'Over ₹3000', value: '3000-100000' }
                            ].map((range) => (
                                <label key={range.value} className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${priceRange === range.value ? 'border-black bg-black dark:border-white dark:bg-white' : 'border-gray-300 dark:border-gray-600'}`}>
                                        {priceRange === range.value && <div className="w-2 h-2 rounded-full bg-white dark:bg-black" />}
                                    </div>
                                    <input
                                        type="radio"
                                        name="price"
                                        className="hidden"
                                        checked={priceRange === range.value}
                                        onChange={() => handleSingleSelect(priceRange, setPriceRange, range.value, 'price')}
                                    />
                                    <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white">{range.label}</span>
                                </label>
                            ))}
                        </FilterSection>

                        {/* Pattern Filter - Single Select (Radio) */}
                        {availablePatterns.length > 0 && (
                            <FilterSection title="Pattern" isOpen={sectionsOpen.pattern} setIsOpen={() => toggleSection('pattern')}>
                                {availablePatterns.map(pattern => (
                                    <label key={pattern} className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${selectedPattern === pattern ? 'border-black bg-black dark:border-white dark:bg-white' : 'border-gray-300 dark:border-gray-600'}`}>
                                            {selectedPattern === pattern && <div className="w-2 h-2 rounded-full bg-white dark:bg-black" />}
                                        </div>
                                        <input
                                            type="radio"
                                            name="pattern"
                                            className="hidden"
                                            checked={selectedPattern === pattern}
                                            onChange={() => handleSingleSelect(selectedPattern, setSelectedPattern, pattern, 'pattern')}
                                        />
                                        <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white">{pattern}</span>
                                    </label>
                                ))}
                            </FilterSection>
                        )}

                        {/* Clear Filters */}
                        {(selectedSubCategory || selectedPattern || priceRange) && (
                            <button
                                onClick={() => {
                                    setSelectedSubCategory('');
                                    setSelectedPattern('');
                                    setPriceRange('');
                                    const newParams = new URLSearchParams(searchParams);
                                    newParams.delete('subCategory');
                                    newParams.delete('pattern');
                                    newParams.delete('price');
                                    setSearchParams(newParams);
                                }}
                                className="mt-6 w-full py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 overflow-x-auto">
                        {(isBrowsingMode || isSubCategoryMode) && attributeSections.length > 0 ? (
                            // Browsing Mode or SubCategory Mode: Show Sections
                            <div className="space-y-8">
                                {attributeSections.map((section, idx) => (
                                    <motion.div
                                        className='mb-2'
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                    >
                                        <ProductRow
                                            title={section.title}
                                            items={section.items}
                                            onExplore={() => navigate(section.link)}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            // Filter Mode: Show Grid
                            <>
                                {filteredProducts.length === 0 ? (
                                    <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                        <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">No products found</p>
                                        <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or search query.</p>
                                        <button
                                            onClick={() => {
                                                setSelectedSubCategory('');
                                                setSelectedPattern('');
                                                setPriceRange('');
                                                handleCategoryClick('All');
                                            }}
                                            className="mt-4 px-6 py-2 bg-black text-white dark:bg-white dark:text-black rounded-full text-sm font-bold hover:opacity-90 transition-opacity"
                                        >
                                            View All Products
                                        </button>
                                    </div>
                                ) : (
                                    <motion.div
                                        initial="hidden"
                                        animate="show"
                                        variants={{
                                            hidden: { opacity: 0 },
                                            show: {
                                                opacity: 1,
                                                transition: { staggerChildren: 0.1 }
                                            }
                                        }}
                                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                                    >
                                        {filteredProducts.map(product => (
                                            <motion.div
                                                key={(product._id || product.id)}
                                                variants={{
                                                    // hidden: { opacity: 0, scale: 0.9 },
                                                    show: { opacity: 1, scale: 1 }
                                                }}
                                            >
                                                <ProductCard product={product} />
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchResults;
