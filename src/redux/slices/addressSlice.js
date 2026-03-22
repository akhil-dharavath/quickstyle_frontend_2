import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';

// FIX: Sync addresses to backend on every mutation so they persist across devices/sessions
export const syncAddressesToBackend = createAsyncThunk(
  'address/syncToBackend',
  async (addresses, { rejectWithValue }) => {
    try {
      await apiService.updateProfile({ addresses });
      return addresses;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to sync addresses');
    }
  }
);

// Load addresses from the logged-in user profile (called after login)
export const loadAddressesFromProfile = createAsyncThunk(
  'address/loadFromProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getProfile();
      return response.data?.addresses || [];
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load addresses');
    }
  }
);

const initialState = {
  addresses: [],
  selectedAddressId: null,
};

const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    addAddress: (state, action) => {
      const payload = action.payload;
      const newAddress = {
        id: Date.now(),
        name: payload.name,
        flatNo: payload.flatNo || '',
        apartment: payload.apartment || '',
        address: payload.address,
        landmark: payload.landmark || '',
        city: payload.city,
        state: payload.state,
        pincode: payload.pincode,
        phone: payload.phone,
        lat: payload.lat ?? null,
        lng: payload.lng ?? null,
        isDefault: state.addresses.length === 0,
      };
      state.addresses.push(newAddress);
      if (newAddress.isDefault) {
        state.selectedAddressId = newAddress.id;
      }
    },

    removeAddress: (state, action) => {
      state.addresses = state.addresses.filter(
        addr => (addr._id || addr.id) !== action.payload
      );
      if (state.selectedAddressId === action.payload) {
        state.selectedAddressId =
          state.addresses.length > 0 ? (state.addresses[0]._id || state.addresses[0].id) : null;
      }
    },

    updateAddress: (state, action) => {
      const index = state.addresses.findIndex(
        addr => (addr._id || addr.id) === (action.payload._id || action.payload.id)
      );
      if (index !== -1) {
        state.addresses[index] = { ...state.addresses[index], ...action.payload };
      }
    },

    setSelectedAddress: (state, action) => {
      state.selectedAddressId = action.payload;
    },

    // Seed addresses from backend user object (used after login)
    setAddresses: (state, action) => {
      state.addresses = action.payload || [];
      if (state.addresses.length > 0 && !state.selectedAddressId) {
        const def = state.addresses.find(a => a.isDefault) || state.addresses[0];
        state.selectedAddressId = def._id || def.id;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAddressesFromProfile.fulfilled, (state, action) => {
        state.addresses = action.payload;
        if (action.payload.length > 0 && !state.selectedAddressId) {
          const def = action.payload.find(a => a.isDefault) || action.payload[0];
          state.selectedAddressId = def._id || def.id;
        }
      });
  },
});

export const {
  addAddress,
  removeAddress,
  updateAddress,
  setSelectedAddress,
  setAddresses,
} = addressSlice.actions;

export default addressSlice.reducer;
