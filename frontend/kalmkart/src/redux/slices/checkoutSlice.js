// checkoutSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  checkout: null,
  order: null,
  loading: false,
  error: null,
  paymentLoading: false,
  finalizeLoading: false
};

export const createCheckoutSession = createAsyncThunk(
  'checkout/create',
  async (checkoutData, { getState, rejectWithValue }) => {
    try {
      // Get token from localStorage (matching auth slice pattern)
      const token = localStorage.getItem('userToken');
      
      if (!token) {
        return rejectWithValue('Authentication required');
      }
      
      // Validate required fields on frontend before API call
      const { checkoutItems, shippingAddress, paymentMethod, totalPrice } = checkoutData;
      
      if (!checkoutItems || checkoutItems.length === 0) {
        return rejectWithValue('No items in checkout');
      }
      
      if (!shippingAddress?.address || !shippingAddress?.city || 
          !shippingAddress?.postalCode || !shippingAddress?.country) {
        return rejectWithValue('Incomplete shipping address');
      }
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkout`,
        checkoutData,
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Checkout creation failed'
      );
    }
  }
);

export const updatePaymentStatus = createAsyncThunk(
  'checkout/updatePayment',
  async ({ checkoutId, paymentStatus, paymentDetails }, { getState, rejectWithValue }) => {
    try {
      // Get token from localStorage (matching auth slice pattern)
      const token = localStorage.getItem('userToken');
      
      if (!token) {
        return rejectWithValue('Authentication required');
      }
      
      // Validate checkoutId format
      if (!checkoutId || checkoutId.length !== 24) {
        return rejectWithValue('Invalid checkout ID');
      }
      
      // Only allow 'Paid' status as per backend logic
      if (paymentStatus !== 'Paid') {
        return rejectWithValue('Invalid payment status');
      }
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      };

      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkoutId}/pay`,
        { paymentStatus, paymentDetails },
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Payment update failed'
      );
    }
  }
);

export const finalizeCheckout = createAsyncThunk(
  'checkout/finalize',
  async (checkoutId, { getState, rejectWithValue }) => {
    try {
      // Get token from localStorage (matching auth slice pattern)
      const token = localStorage.getItem('userToken');
      
      if (!token) {
        return rejectWithValue('Authentication required');
      }
      
      // Validate checkoutId
      if (!checkoutId || checkoutId.length !== 24) {
        return rejectWithValue('Invalid checkout ID');
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/checkout/${checkoutId}/finalize`,
        {},
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Checkout finalization failed'
      );
    }
  }
);

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    clearCheckout: (state) => {
      state.checkout = null;
      state.order = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetCheckoutState: (state) => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create checkout session
      .addCase(createCheckoutSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCheckoutSession.fulfilled, (state, action) => {
        state.loading = false;
        state.checkout = action.payload;
        state.error = null;
      })
      .addCase(createCheckoutSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update payment status
      .addCase(updatePaymentStatus.pending, (state) => {
        state.paymentLoading = true;
        state.error = null;
      })
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        state.paymentLoading = false;
        state.checkout = action.payload;
        state.error = null;
      })
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.paymentLoading = false;
        state.error = action.payload;
      })
      
      // Finalize checkout
      .addCase(finalizeCheckout.pending, (state) => {
        state.finalizeLoading = true;
        state.error = null;
      })
      .addCase(finalizeCheckout.fulfilled, (state, action) => {
        state.finalizeLoading = false;
        state.order = action.payload;
        state.error = null;
        // Clear checkout after successful finalization since cart is deleted on backend
        state.checkout = null;
      })
      .addCase(finalizeCheckout.rejected, (state, action) => {
        state.finalizeLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCheckout, clearError, resetCheckoutState } = checkoutSlice.actions;
export default checkoutSlice.reducer;