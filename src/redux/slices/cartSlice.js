import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  total: 0,
  discount: 0,
  coupon: null,
};

// FIX: Use product._id || product.id — MongoDB documents use _id, not id.
// Previously this used only `product.id` which is always undefined for DB products,
// causing every cart item to get id `undefined-size-color` and collide.
const generateCartItemId = (product, size, color) => {
  const id = product._id || product.id;
  return `${id}-${size}-${color}`;
};

const recalculate = (state) => {
  state.total = state.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  if (state.coupon === 'SAVE20') state.discount = Math.round(state.total * 0.2);
  else if (state.coupon === 'WELCOME10') state.discount = Math.round(state.total * 0.1);
  else state.discount = 0;
  if (state.total === 0) { state.coupon = null; state.discount = 0; }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    applyCoupon: (state, action) => {
      const code = action.payload.toUpperCase();
      // NOTE: Coupon codes are validated here for UX, but the backend
      // recalculates the real total and does NOT honour frontend totals.
      if (code === 'SAVE20') {
        state.coupon = 'SAVE20';
        state.discount = Math.round(state.total * 0.2);
      } else if (code === 'WELCOME10') {
        state.coupon = 'WELCOME10';
        state.discount = Math.round(state.total * 0.1);
      } else {
        state.coupon = null;
        state.discount = 0;
      }
    },
    removeCoupon: (state) => {
      state.coupon = null;
      state.discount = 0;
    },
    addToCart: (state, action) => {
      const { selectedSize, selectedColor, quantity } = action.payload;
      const cartItemId = generateCartItemId(action.payload, selectedSize, selectedColor);

      // FIX: Enforce single-shop cart — if new item is from a different shop, clear cart first.
      // This prevents the Checkout bug where items from multiple shops are submitted but
      // only the first shop's ID is used, silently dropping orders for the other shop.
      const newShopId = action.payload.shopId || action.payload.shop;
      if (state.items.length > 0 && newShopId) {
        const existingShopId = state.items[0].shopId || state.items[0].shop;
        if (existingShopId && existingShopId.toString() !== newShopId.toString()) {
          // Clear the cart — UI should have confirmed this with the user before dispatching
          state.items = [];
          state.total = 0;
          state.discount = 0;
          state.coupon = null;
        }
      }

      const existingItem = state.items.find(item => item.cartItemId === cartItemId);
      if (existingItem) {
        existingItem.quantity += (quantity || 1);
      } else {
        state.items.push({
          ...action.payload,
          cartItemId,
          quantity: quantity || 1,
        });
      }
      recalculate(state);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.cartItemId !== action.payload);
      recalculate(state);
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => item.cartItemId === id);
      if (item) {
        item.quantity = Math.max(1, quantity); // prevent 0
        recalculate(state);
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.discount = 0;
      state.coupon = null;
    }
  },
});

export const {
  addToCart, removeFromCart, updateQuantity, clearCart, applyCoupon, removeCoupon
} = cartSlice.actions;

export default cartSlice.reducer;
