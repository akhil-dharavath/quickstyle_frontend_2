import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUserLocation } from '../../redux/slices/uiSlice';
import { ArrowUp } from 'lucide-react';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import BottomNav from './BottomNav';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrderNotifications } from '../../hooks/useOrderNotifications';

const MainLayout = () => {
    const [showScrollTop, setShowScrollTop] = useState(false);
    const location = useLocation();
    const dispatch = useDispatch();
    const { userLocation } = useSelector(state => state.ui);

    useOrderNotifications();

    // Global Geolocation request
    useEffect(() => {
        if (!userLocation && "geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    dispatch(setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    }));
                },
                (error) => {
                    console.error("Error getting location globally:", error);
                    // Fallback to a default location if user denies permission or error occurs
                    dispatch(setUserLocation({ lat: 17.4401, lng: 78.3489, name: "Gachibowli (Default)" }));
                }
            );
        } else if (!userLocation) {
            console.log("Geolocation is not supported by this browser.");
            dispatch(setUserLocation({ lat: 17.4401, lng: 78.3489, name: "Gachibowli (Default)" }));
        }
    }, [dispatch, userLocation]);

    // Auto-scroll to top on route change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    // Scroll to Top visibility logic
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 md:pb-0 flex flex-col">
            <Navbar />
            <main className="flex-grow w-full relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full"
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>
            <Footer />
            <BottomNav />

            {/* Scroll to Top Button */}
            <AnimatePresence>
                {showScrollTop && (
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        onClick={scrollToTop}
                        className="fixed bottom-20 right-6 md:bottom-8 md:right-8 p-3 bg-black dark:bg-white text-white dark:text-black rounded-full shadow-lg hover:scale-110 transition-transform z-40"
                    >
                        <ArrowUp className="h-6 w-6" />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MainLayout;
