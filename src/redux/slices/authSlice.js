import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/api';

// FIX: All thunks now catch `error.message` instead of `error.response?.data?.message`.
// The api.js interceptor normalises all errors into plain Error objects, so
// error.response is always undefined inside thunks — the message lives on error.message.

export const loginUser = createAsyncThunk('auth/login', async ({ email, password }, thunkAPI) => {
  try {
    const response = await apiService.login(email, password);
    const user = response.data;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
  try {
    const response = await apiService.registerWithOtp(userData);
    const user = response.data;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message || 'Registration failed');
  }
});

export const googleLogin = createAsyncThunk('auth/googleLogin', async (credential, thunkAPI) => {
  try {
    const response = await apiService.googleLogin(credential);
    const user = response.data;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message || 'Google login failed');
  }
});

export const updateUserProfile = createAsyncThunk('auth/updateProfile', async (userData, thunkAPI) => {
  try {
    const response = await apiService.updateProfile(userData);
    const user = response.data;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message || 'Profile update failed');
  }
});

export const requestEmailOtp = createAsyncThunk('auth/requestEmailOtp', async (data, thunkAPI) => {
  try {
    const response = await apiService.requestEmailOtp(data);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message || 'Failed to request email OTP');
  }
});

export const verifyEmailOtp = createAsyncThunk('auth/verifyEmailOtp', async (data, thunkAPI) => {
  try {
    const response = await apiService.verifyEmailOtp(data);
    const user = response.data;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message || 'Failed to verify email OTP');
  }
});

export const requestPhoneOtp = createAsyncThunk('auth/requestPhoneOtp', async (data, thunkAPI) => {
  try {
    const response = await apiService.requestPhoneOtp(data);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message || 'Failed to request phone OTP');
  }
});

export const verifyPhoneOtp = createAsyncThunk('auth/verifyPhoneOtp', async (data, thunkAPI) => {
  try {
    const response = await apiService.verifyPhoneOtp(data);
    const user = response.data;
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message || 'Failed to verify phone OTP');
  }
});

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.error = null;
      localStorage.removeItem('user');
    },
    updateProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.isLoading = true; state.error = null; };
    const rejected = (state, action) => {
      state.isLoading = false;
      state.error = action.payload || 'Something went wrong';
    };

    builder
      .addCase(loginUser.pending, pending)
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false; state.user = action.payload; state.error = null;
      })
      .addCase(loginUser.rejected, rejected)

      .addCase(registerUser.pending, pending)
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false; state.user = action.payload; state.error = null;
      })
      .addCase(registerUser.rejected, rejected)

      .addCase(googleLogin.pending, pending)
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.isLoading = false; state.user = action.payload; state.error = null;
      })
      .addCase(googleLogin.rejected, rejected)

      .addCase(updateUserProfile.pending, pending)
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false; state.user = action.payload; state.error = null;
      })
      .addCase(updateUserProfile.rejected, rejected)

      .addCase(verifyEmailOtp.fulfilled, (state, action) => {
        state.isLoading = false; state.user = action.payload;
      })
      .addCase(verifyPhoneOtp.fulfilled, (state, action) => {
        state.isLoading = false; state.user = action.payload;
      });
  },
});

export const { logout, updateProfile, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
