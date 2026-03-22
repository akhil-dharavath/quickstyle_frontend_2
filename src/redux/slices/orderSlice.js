import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';

// ─────────────────────────────────────────────────────────────────────────────
// FIX: ALL thunks must be defined BEFORE createSlice so that addCase()
// inside extraReducers references the correct action type strings.
// Previously they were defined AFTER createSlice — JavaScript does NOT hoist
// createAsyncThunk calls, so all five addCase handlers registered against
// `undefined` and never fired.
// ─────────────────────────────────────────────────────────────────────────────

export const fetchOrders = createAsyncThunk('orders/fetchAll', async (_, thunkAPI) => {
  try {
    const response = await apiService.getOrders();
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message || 'Failed to fetch orders');
  }
});

export const fetchDeliveryOrders = createAsyncThunk('orders/fetchDelivery', async (_, { rejectWithValue }) => {
  try {
    const [available, assigned] = await Promise.all([
      apiService.getAvailablePickups(),
      apiService.getAssignedOrders(),
    ]);
    const availableData = Array.isArray(available.data) ? available.data : [];
    const assignedData = Array.isArray(assigned.data) ? assigned.data : [];
    const combined = [...availableData, ...assignedData];
    // Deduplicate by _id
    const seen = new Set();
    return combined.filter(o => {
      const id = o._id || o.id;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to fetch delivery orders');
  }
});

export const fetchShopOrders = createAsyncThunk('orders/fetchShopOrders', async (_, thunkAPI) => {
  try {
    const response = await apiService.getShopOrders();
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message || 'Failed to fetch shop orders');
  }
});

export const fetchActiveDeliveries = createAsyncThunk('orders/fetchActiveDeliveries', async (_, thunkAPI) => {
  try {
    const response = await apiService.getActiveDeliveries();
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message || 'Failed to fetch active deliveries');
  }
});

export const createNewOrder = createAsyncThunk('orders/create', async (orderData, { rejectWithValue }) => {
  try {
    const response = await apiService.createOrder(orderData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to create order');
  }
});

export const requestReplacementItem = createAsyncThunk('orders/replaceItem', async ({ orderId, itemId }, { rejectWithValue }) => {
  try {
    // FIX: apiService.requestReplacement now exists (was missing before)
    const response = await apiService.requestReplacement(orderId, itemId);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to request replacement');
  }
});

export const updateOrderDeliveryStatus = createAsyncThunk('orders/updateDeliveryStatus', async ({ orderId, deliveryStatus }, { rejectWithValue }) => {
  try {
    const response = await apiService.updateDeliveryStatus(orderId, { status: deliveryStatus });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to update status');
  }
});

export const verifyDeliveryOTP = createAsyncThunk('orders/verifyOTP', async ({ orderId, otp }, { rejectWithValue }) => {
  try {
    const response = await apiService.updateDeliveryStatus(orderId, { status: 'Delivered', otp });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.message || 'OTP verification failed');
  }
});

export const cancelOrder = createAsyncThunk('orders/cancel', async (orderId, { rejectWithValue }) => {
  try {
    const response = await apiService.cancelOrder(orderId);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to cancel order');
  }
});

// FIX: New thunk — seller marks order Ready for Pickup via real API call
export const updateOrderStatusBySeller = createAsyncThunk('orders/updateStatusBySeller', async ({ orderId, status }, { rejectWithValue }) => {
  try {
    const response = await apiService.updateOrderStatusBySeller(orderId, status);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to update order status');
  }
});

export const fetchDeliveryHistory = createAsyncThunk('orders/fetchDeliveryHistory', async (_, { rejectWithValue }) => {
  try {
    const response = await apiService.getDeliveryHistory();
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to fetch delivery history');
  }
});

// ─────────────────────────────────────────────────────────────────────────────

const initialState = {
  // FIX: Separate state keys per role — previously all three fetch thunks wrote
  // to state.orders and the last one to resolve would overwrite the others.
  customerOrders: [],   // fetchOrders
  deliveryOrders: [],   // fetchDeliveryOrders
  deliveryHistory: [],  // fetchDeliveryHistory
  shopOrders: [],       // fetchShopOrders
  // Keep state.orders as an alias pointing to the most recently loaded set
  // so existing components that read state.orders.orders still work
  orders: [],
  activeDeliveries: [],
  isLoading: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    updateOrderStatus: (state, action) => {
      const { id, status } = action.payload;
      const order = state.orders.find(o => (o._id || o.id) === id);
      if (order) {
        order.status = status;
        order.deliveryStatus = status; // keep in sync
      }
    },
    assignDeliveryPersonToOrder: (state, action) => {
      const { orderId, deliveryPersonId } = action.payload;
      const order = state.orders.find(o => (o._id || o.id) === orderId);
      if (order) {
        order.assignedDeliveryPersonId = deliveryPersonId;
        order.deliveryStatus = 'Assigned';
        order.status = 'Assigned';
      }
    },
    uploadDeliveryProof: (state, action) => {
      const { orderId, type, photoUrl } = action.payload;
      const order = state.orders.find(o => (o._id || o.id) === orderId);
      if (order) {
        if (type === 'pickup') order.pickupPhoto = photoUrl;
        else if (type === 'delivery') order.deliveryPhoto = photoUrl;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customerOrders = action.payload;
        state.orders = action.payload; // keep alias in sync for legacy consumers
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      })

      .addCase(fetchDeliveryOrders.pending, (state) => { state.isLoading = true; })
      .addCase(fetchDeliveryOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.deliveryOrders = action.payload;
        state.orders = action.payload; // keep alias in sync
      })
      .addCase(fetchDeliveryOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      })

      .addCase(fetchShopOrders.pending, (state) => { state.isLoading = true; })
      .addCase(fetchShopOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shopOrders = action.payload;
        state.orders = action.payload; // keep alias in sync
      })
      .addCase(fetchShopOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      })


      .addCase(fetchDeliveryHistory.pending, (state) => { state.isLoading = true; })
      .addCase(fetchDeliveryHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.deliveryHistory = action.payload;
      })
      .addCase(fetchDeliveryHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchActiveDeliveries.fulfilled, (state, action) => {
        state.activeDeliveries = action.payload;
      })

      .addCase(createNewOrder.fulfilled, (state, action) => {
        state.orders.unshift(action.payload);
      })

      .addCase(requestReplacementItem.fulfilled, (state, action) => {
        const updatedOrder = action.payload;
        const id = updatedOrder._id || updatedOrder.id;
        const index = state.orders.findIndex(o => (o._id || o.id) === id);
        if (index !== -1) {
          state.orders[index] = { ...state.orders[index], ...updatedOrder };
        }
      })

      .addCase(updateOrderDeliveryStatus.fulfilled, (state, action) => {
        const updatedOrder = action.payload;
        const id = updatedOrder._id || updatedOrder.id;
        const index = state.orders.findIndex(o => (o._id || o.id) === id);
        if (index !== -1) {
          state.orders[index] = { ...state.orders[index], ...updatedOrder };
        }
      })

      .addCase(verifyDeliveryOTP.fulfilled, (state, action) => {
        const updatedOrder = action.payload;
        const id = updatedOrder._id || updatedOrder.id;
        const index = state.orders.findIndex(o => (o._id || o.id) === id);
        if (index !== -1) {
          state.orders[index] = { ...state.orders[index], ...updatedOrder, otpVerified: true };
        }
      })

      .addCase(cancelOrder.fulfilled, (state, action) => {
        const updated = action.payload;
        const id = updated._id || updated.id;
        const index = state.orders.findIndex(o => (o._id || o.id) === id);
        if (index !== -1) {
          state.orders[index] = { ...state.orders[index], ...updated };
        }
      })

      .addCase(updateOrderStatusBySeller.fulfilled, (state, action) => {
        const updated = action.payload;
        const id = updated._id || updated.id;
        const index = state.orders.findIndex(o => (o._id || o.id) === id);
        if (index !== -1) {
          state.orders[index] = { ...state.orders[index], ...updated };
        }
      });
  },
});

export const { updateOrderStatus, assignDeliveryPersonToOrder, uploadDeliveryProof } = orderSlice.actions;
export default orderSlice.reducer;
