import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchOrders } from '../redux/slices/orderSlice';

const STATUS_MESSAGES = {
    'Confirmed':        'Your order has been confirmed!',
    'Preparing':        'The seller is preparing your order.',
    'Ready for Pickup': 'Your order is packed and ready — delivery partner on the way!',
    'Picked Up':        'Your order has been picked up by the delivery partner!',
    'On the way':       'Your order is on the way!',
    'Out for Delivery': 'Your order is out for delivery!',
    'Delivered':        'Your order has been delivered!',
    'Cancelled':        'Your order has been cancelled.',
};

// FIX: Added internal polling (every 30s) so status-change notifications fire
// even when the user is browsing pages other than /orders.
// Previously the hook only reacted to Redux state changes — if orders were never
// re-fetched (user left /orders page), no notifications would ever fire.
export const useOrderNotifications = () => {
    const dispatch = useDispatch();
    const { orders } = useSelector(state => state.orders);
    const { user } = useSelector(state => state.auth);
    const prevStatusMapRef = useRef({});
    const isInitialLoadRef = useRef(true);
    const pollingRef = useRef(null);

    // Request browser notification permission once on mount
    useEffect(() => {
        if (!user || user.role !== 'customer') return;
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().catch(() => {});
        }
    }, [user]);

    // Start polling when the user is a logged-in customer
    useEffect(() => {
        if (!user || user.role !== 'customer') return;

        // Poll every 30 seconds to detect status changes
        pollingRef.current = setInterval(() => {
            dispatch(fetchOrders());
        }, 30000);

        return () => clearInterval(pollingRef.current);
    }, [user, dispatch]);

    // Detect status changes whenever orders state updates
    useEffect(() => {
        if (!user || user.role !== 'customer' || !Array.isArray(orders)) return;

        const currentMap = {};
        orders.forEach(order => {
            const id = order._id || order.id;
            // Ignore fake frontend-only orders
            if (id && !String(id).startsWith('ord_')) {
                currentMap[id] = order.deliveryStatus || order.status || 'Pending';
            }
        });

        const prevMap = prevStatusMapRef.current;

        // Skip notifications on the very first load (avoid spamming current state)
        if (isInitialLoadRef.current) {
            isInitialLoadRef.current = false;
            prevStatusMapRef.current = currentMap;
            return;
        }

        // Detect changes and fire toast + browser notification
        Object.keys(currentMap).forEach(id => {
            const currentStatus = currentMap[id];
            const prevStatus = prevMap[id];

            if (prevStatus && prevStatus !== currentStatus && STATUS_MESSAGES[currentStatus]) {
                const message = STATUS_MESSAGES[currentStatus];
                const shortId = id.slice(-6).toUpperCase();

                // In-app toast
                toast.success(
                    <div>
                        <p className="font-bold text-sm">Order #{shortId}</p>
                        <p className="text-xs">{message}</p>
                    </div>,
                    { position: 'top-right', autoClose: 6000 }
                );

                // Browser push notification (if permission granted)
                if ('Notification' in window && Notification.permission === 'granted') {
                    try {
                        new Notification('QuickStyle Order Update', {
                            body: `Order #${shortId}: ${message}`,
                            icon: '/vite.svg',
                        });
                    } catch {
                        // Notification API may be unavailable in some environments
                    }
                }
            }
        });

        prevStatusMapRef.current = currentMap;
    }, [orders, user]);
};
