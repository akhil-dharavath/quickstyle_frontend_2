import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import sellerReducer from './slices/sellerSlice';
import productReducer from './slices/productSlice';
import orderReducer from './slices/orderSlice';
import cartReducer from './slices/cartSlice';
import userReducer from './slices/userSlice';
import wishlistReducer from './slices/wishlistSlice';
import addressReducer from './slices/addressSlice';
import uiReducer from './slices/uiSlice';
import deliveryReducer from './slices/deliverySlice';
import recentlyViewedReducer from './slices/recentlyViewedSlice';

// FIX: Add a state schema version — bump this when Redux state shape changes.
// If the persisted version doesn't match, stale state is discarded safely
// instead of causing silent runtime errors or missing reducers.
const STATE_VERSION = 2;

const loadState = () => {
  try {
    const serializedState = localStorage.getItem('reduxState');
    if (serializedState === null) return undefined;
    const parsed = JSON.parse(serializedState);
    // FIX: Discard stale persisted state if schema version has changed
    if (parsed._version !== STATE_VERSION) {
      console.info('Redux state schema changed — clearing stale persisted state');
      localStorage.removeItem('reduxState');
      return undefined;
    }
    return parsed;
  } catch (err) {
    return undefined;
  }
};

const saveState = (state) => {
  try {
    // FIX: Only persist non-sensitive, non-stale slices
    // auth token is stored separately in localStorage by authSlice itself
    // orders/delivery are always fetched fresh — not persisted
    const serializedState = JSON.stringify({
      _version: STATE_VERSION,
      cart: state.cart,
      wishlist: state.wishlist,
      // Note: addresses are now synced to backend — localStorage is just a cache
      address: state.address,
      recentlyViewed: state.recentlyViewed,
    });
    localStorage.setItem('reduxState', serializedState);
  } catch {
    // Ignore write errors (e.g. storage quota exceeded)
  }
};

const preloadedState = loadState();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    sellers: sellerReducer,
    products: productReducer,
    orders: orderReducer,
    cart: cartReducer,
    users: userReducer,
    wishlist: wishlistReducer,
    address: addressReducer,
    ui: uiReducer,
    delivery: deliveryReducer,
    recentlyViewed: recentlyViewedReducer,
  },
  preloadedState,
});

let saveTimer;
store.subscribe(() => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveState(store.getState());
  }, 1000);
});
