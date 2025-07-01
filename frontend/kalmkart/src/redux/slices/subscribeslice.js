import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk for subscribing to newsletter
export const subscribeToNewsletter = createAsyncThunk(
  'newsletter/subscribe',
  async (email, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/subscribe`, { email });
      return response.data;
    } catch (error) {
      // Handle different error responses
      if (error.response) {
        return rejectWithValue(error.response.data.message || error.response.data);
      }
      return rejectWithValue(error.message);
    }
  }
);

const newsletterSlice = createSlice({
  name: 'newsletter',
  initialState: {
    loading: false,
    success: false,
    error: null,
    subscribedEmails: [] // Optional: track subscribed emails in state
  },
  reducers: {
    // Reset the subscription state
    resetSubscription: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(subscribeToNewsletter.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(subscribeToNewsletter.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        // Optional: add the email to subscribedEmails array
        state.subscribedEmails.push(action.meta.arg);
      })
      .addCase(subscribeToNewsletter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to subscribe';
        state.success = false;
      });
  }
});

export const { resetSubscription } = newsletterSlice.actions;
export default newsletterSlice.reducer;