import { createSlice } from '@reduxjs/toolkit';

const getInitialState = () => {
    try {
        const stored = sessionStorage.getItem('recentlyViewed');
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
};

const initialState = {
  items: getInitialState(),
};

const recentlyViewedSlice = createSlice({
  name: 'recentlyViewed',
  initialState,
  reducers: {
    addRecentlyViewed: (state, action) => {
      const product = action.payload;
      // Remove if exists
      const filtered = state.items.filter(item => (item._id || item.id) !== (product._id || product.id));
      // Add to front
      filtered.unshift(product);
      // Keep max 10
      state.items = filtered.slice(0, 10);
      try {
          sessionStorage.setItem('recentlyViewed', JSON.stringify(state.items));
      } catch (e) {
          console.warn('Failed to save recently viewed to sessionStorage');
      }
    },
    clearRecentlyViewed: (state) => {
      state.items = [];
      sessionStorage.removeItem('recentlyViewed');
    }
  }
});

export const { addRecentlyViewed, clearRecentlyViewed } = recentlyViewedSlice.actions;
export default recentlyViewedSlice.reducer;
