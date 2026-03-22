import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';

// FIX: All thunks use error.message instead of error.response?.data?.message.
// api.js normalises all errors into plain Error objects — .response is always
// undefined inside thunks.

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params, thunkAPI) => {
  try {
    const response = await apiService.getProducts(params);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message || 'Failed to fetch products');
  }
});

export const approveProduct = createAsyncThunk('products/approve', async ({ productId, status }, thunkAPI) => {
  try {
    const response = await apiService.approveProduct(productId, status);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message || 'Failed to approve product');
  }
});

export const addProduct = createAsyncThunk('products/add', async (productData, thunkAPI) => {
  try {
    const response = await apiService.createProduct(productData);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message || 'Failed to add product');
  }
});

export const updateProduct = createAsyncThunk('products/update', async (productData, thunkAPI) => {
  try {
    const { id, _id, ...data } = productData;
    const productId = id || _id;
    if (!productId) throw new Error('No product ID provided for update');
    const response = await apiService.updateProduct(productId, data);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message || 'Failed to update product');
  }
});

export const deleteProduct = createAsyncThunk('products/delete', async (productId, thunkAPI) => {
  try {
    await apiService.deleteProduct(productId);
    return productId;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message || 'Failed to delete product');
  }
});

const initialState = {
  products: [],
  isLoading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    addReview: (state, action) => {
      const { productId, review } = action.payload;
      const product = state.products.find(p => (p._id || p.id) === productId);
      if (product) {
        if (!product.reviewsList) product.reviewsList = [];
        product.reviewsList.unshift(review);
        product.rating = (product.rating * product.reviews + review.rating) / (product.reviews + 1);
        product.reviews += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        const newProd = { ...action.payload, id: action.payload._id || action.payload.id };
        state.products.unshift(newProd);
      })
      .addCase(addProduct.rejected, (state, action) => { state.error = action.payload; })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const updated = action.payload;
        const productId = updated._id || updated.id;
        const index = state.products.findIndex(p => (p._id || p.id) === productId);
        if (index !== -1) {
          state.products[index] = { ...state.products[index], ...updated, id: productId };
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(p => (p._id || p.id) !== action.payload && p._id !== action.payload);
      });
  },
});

export const { addReview } = productSlice.actions;
export default productSlice.reducer;
