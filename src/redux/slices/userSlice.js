import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';

// FIX: Use error.message — api.js normalises all errors, .response?.data?.message is always undefined in thunks

export const fetchUsers = createAsyncThunk('users/fetchAll', async (_, thunkAPI) => {
  try {
    const response = await apiService.getUsers();
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message || 'Failed to fetch users');
  }
});

export const toggleUserStatusAsync = createAsyncThunk('users/toggleStatus', async (userId, thunkAPI) => {
  try {
    const response = await apiService.toggleUserStatus(userId);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message || 'Failed to toggle status');
  }
});

export const deleteUserAsync = createAsyncThunk('users/deleteUser', async (userId, thunkAPI) => {
  try {
    await apiService.deleteUser(userId);
    return userId;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message || 'Failed to delete user');
  }
});

const initialState = {
  users: [],
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(toggleUserStatusAsync.fulfilled, (state, action) => {
        const updatedUser = action.payload;
        const index = state.users.findIndex(u => (u._id || u.id) === updatedUser._id);
        if (index !== -1) state.users[index] = { ...state.users[index], ...updatedUser };
      })
      .addCase(toggleUserStatusAsync.rejected, (state, action) => { state.error = action.payload; })
      .addCase(deleteUserAsync.fulfilled, (state, action) => {
        state.users = state.users.filter(u => (u._id || u.id) !== action.payload);
      })
      .addCase(deleteUserAsync.rejected, (state, action) => { state.error = action.payload; });
  },
});

export default userSlice.reducer;
