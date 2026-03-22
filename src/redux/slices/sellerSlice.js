// ========== sellerSlice.js ==========
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';

export const fetchSellers = createAsyncThunk('sellers/fetchAll', async (params, thunkAPI) => {
  try {
    const response = await apiService.getShops(params);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message || 'Failed to fetch sellers');
  }
});

const initialState = {
  sellers: [],
  isLoading: false,
  error: null,
};

const sellerSlice = createSlice({
  name: 'sellers',
  initialState,
  reducers: {
    addSeller: (state, action) => {
      state.sellers.push({
        id: `u${Date.now()}`,
        rating: 0,
        products: 0,
        sales: 0,
        joined: new Date().toISOString().split('T')[0],
        location: action.payload.packingAddress
          ? { lat: action.payload.packingAddress.lat || 17.44, lng: action.payload.packingAddress.lng || 78.37, name: action.payload.packingAddress.city }
          : { lat: 17.44, lng: 78.37, name: 'Hyderabad' },
        packingAddress: action.payload.packingAddress || {},
        ...action.payload,
      });
    },
    updateSellerStatus: (state, action) => {
      const { id, isBlocked } = action.payload;
      const seller = state.sellers.find((s) => (s._id || s.id) === id);
      if (seller) seller.isBlocked = isBlocked;
    },
    deleteSeller: (state, action) => {
      state.sellers = state.sellers.filter((s) => (s._id || s.id) !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSellers.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchSellers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sellers = action.payload;
      })
      .addCase(fetchSellers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { addSeller, updateSellerStatus, deleteSeller } = sellerSlice.actions;
export default sellerSlice.reducer;
