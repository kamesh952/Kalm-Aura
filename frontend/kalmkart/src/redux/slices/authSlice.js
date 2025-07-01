import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { fetchCart, mergeCarts } from './cartSlice';

// Get user/token from localStorage
const userFromStorage = localStorage.getItem("userInfo")
  ? JSON.parse(localStorage.getItem("userInfo"))
  : null;

const initialGuestId = localStorage.getItem("guestId") || `guest_${new Date().getTime()}`;
localStorage.setItem("guestId", initialGuestId);

const initialState = {
  user: userFromStorage,
  guestId: initialGuestId,
  loading: false,
  error: null,
};

// Login thunk with automatic cart handling
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/login`,
        {
          email: userData.email.trim(),
          password: userData.password.trim(),
        },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.data.success) {
        return rejectWithValue(response.data.message || 'Login failed');
      }

      localStorage.setItem('userInfo', JSON.stringify(response.data.user));
      localStorage.setItem('userToken', response.data.token);

      // Fetch user's cart after successful login
      dispatch(fetchCart({ userId: response.data.user.id, guestId: null }));

      // If there was a guest cart, merge it
      if (userData.guestId) {
        await dispatch(mergeCarts({ 
          userId: response.data.user.id, 
          guestId: userData.guestId 
        }));
        // Refresh cart after merge
        dispatch(fetchCart({ userId: response.data.user.id, guestId: null }));
      }

      return response.data.user;
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        return rejectWithValue(
          error.response.data?.message || 
          error.response.data?.error || 
          'Login failed'
        );
      }
      return rejectWithValue(error.message || 'Login request failed');
    }
  }
);

// Register thunk with automatic cart handling
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      const config = {
        headers: { "Content-Type": "application/json" },
      };

      const payload = {
        name: userData.name.trim(),
        email: userData.email.trim(),
        password: userData.password.trim(),
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/register`,
        payload,
        config
      );

      localStorage.setItem("userInfo", JSON.stringify(response.data.user));
      localStorage.setItem("userToken", JSON.stringify(response.data.token));

      // Fetch user's cart after successful registration
      dispatch(fetchCart({ userId: response.data.user.id, guestId: null }));

      // If there was a guest cart, merge it
      if (userData.guestId) {
        await dispatch(mergeCarts({ 
          userId: response.data.user.id, 
          guestId: userData.guestId 
        }));
        // Refresh cart after merge
        dispatch(fetchCart({ userId: response.data.user.id, guestId: null }));
      }

      return response.data.user;
    } catch (error) {
      console.error("Register error:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.error = null;
      localStorage.removeItem("userInfo");
      localStorage.removeItem("userToken");
      localStorage.setItem("guestId", state.guestId);
    },
    generateNewGuestId: (state) => {
      state.guestId = `guest_${new Date().getTime()}`;
      localStorage.setItem("guestId", state.guestId);
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, generateNewGuestId, clearAuthError } = authSlice.actions;
export default authSlice.reducer;