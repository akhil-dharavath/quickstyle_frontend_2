import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';

export const fetchDeliveryPersons = createAsyncThunk('delivery/fetchAll', async () => {
  const response = await apiService.getDeliveryPersons();
  return response.data;
});

const initialState = {
  deliveryPersons: [],
  isLoading: false,
  error: null,
};

const deliverySlice = createSlice({
  name: 'delivery',
  initialState,
  reducers: {
    addDeliveryPerson: (state, action) => {
      // FIX: Real delivery partners are created via backend invites.
      // This reducer simply pushes the new authorized user from the backend response.
      state.deliveryPersons.push(action.payload);
    },
    updateDeliveryPerson: (state, action) => {
      const idx = state.deliveryPersons.findIndex((d) => (d._id || d.id) === (action.payload._id || action.payload.id));
      if (idx !== -1) {
        state.deliveryPersons[idx] = { ...state.deliveryPersons[idx], ...action.payload };
      }
    },
    updateDeliveryPersonLocation: (state, action) => {
      const { id, lat, lng } = action.payload;
      const person = state.deliveryPersons.find((d) => (d._id || d.id) === id);
      if (person) {
        person.currentLocation = { lat, lng };
      }
    },
    assignOrderToDelivery: (state, action) => {
      const { deliveryPersonId, orderId } = action.payload;
      const person = state.deliveryPersons.find((d) => (d._id || d.id) === deliveryPersonId);
      if (person) {
        person.assignedOrderId = orderId;
      }
    },
    clearDeliveryAssignment: (state, action) => {
      const person = state.deliveryPersons.find((d) => (d._id || d.id) === action.payload);
      if (person) {
        person.assignedOrderId = null;
      }
    },
    deleteDeliveryPerson: (state, action) => {
      state.deliveryPersons = state.deliveryPersons.filter((d) => (d._id || d.id) !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeliveryPersons.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDeliveryPersons.fulfilled, (state, action) => {
        state.isLoading = false;
        state.deliveryPersons = action.payload;
      })
      .addCase(fetchDeliveryPersons.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const {
  addDeliveryPerson,
  updateDeliveryPerson,
  updateDeliveryPersonLocation,
  assignOrderToDelivery,
  clearDeliveryAssignment,
  deleteDeliveryPerson,
} = deliverySlice.actions;

export default deliverySlice.reducer;
