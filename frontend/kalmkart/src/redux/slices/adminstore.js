import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Get token from localStorage
const getAuthToken = () => {
  return localStorage.getItem("userToken");
};

// API base URL
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const initialState = {
  storeSettings: {
    storeName: '',
    storeDescription: '',
    storeAddress: '',
    storePhone: '',
    storeEmail: '',
    logo: '',
    businessHours: {
      monday: { open: '09:00', close: '18:00', isOpen: true },
      tuesday: { open: '09:00', close: '18:00', isOpen: true },
      wednesday: { open: '09:00', close: '18:00', isOpen: true },
      thursday: { open: '09:00', close: '18:00', isOpen: true },
      friday: { open: '09:00', close: '18:00', isOpen: true },
      saturday: { open: '10:00', close: '16:00', isOpen: true },
      sunday: { open: '10:00', close: '16:00', isOpen: false }
    },
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: ''
    },
    paymentMethods: {
      creditCard: true,
      debitCard: true,
      paypal: true,
      bankTransfer: false,
      cashOnDelivery: true
    },
    shippingSettings: {
      freeShippingThreshold: 50,
      standardShippingCost: 5.99,
      expressShippingCost: 12.99,
      internationalShipping: false
    }
  },
  isStoreOpen: true,
  loading: false,
  error: null,
  updateLoading: false
};

// Fetch store settings
export const fetchStoreSettings = createAsyncThunk(
  'store/fetchStoreSettings',
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const response = await axios.get(
        `${API_BASE_URL}/api/admin/store/settings`,
        config
      );

      return response.data;
    } catch (error) {
      console.error('Fetch store settings error:', error);
      if (error.response) {
        return rejectWithValue(
          error.response.data?.message || 
          error.response.data?.error || 
          'Failed to fetch store settings'
        );
      }
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Update store settings
export const updateStoreSettings = createAsyncThunk(
  'store/updateStoreSettings',
  async (settingsData, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const response = await axios.put(
        `${API_BASE_URL}/api/admin/store/settings`,
        settingsData,
        config
      );

      return response.data;
    } catch (error) {
      console.error('Update store settings error:', error);
      if (error.response) {
        return rejectWithValue(
          error.response.data?.message || 
          error.response.data?.error || 
          'Failed to update store settings'
        );
      }
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Update store logo
export const updateStoreLogo = createAsyncThunk(
  'store/updateStoreLogo',
  async (logoFormData, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      const response = await axios.put(
        `${API_BASE_URL}/api/admin/store/logo`,
        logoFormData,
        config
      );

      return response.data;
    } catch (error) {
      console.error('Update store logo error:', error);
      if (error.response) {
        return rejectWithValue(
          error.response.data?.message || 
          error.response.data?.error || 
          'Failed to update store logo'
        );
      }
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Update store status (open/closed)
export const updateStoreStatus = createAsyncThunk(
  'store/updateStoreStatus',
  async (isOpen, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const response = await axios.put(
        `${API_BASE_URL}/api/admin/store/status`,
        { isStoreOpen: isOpen },
        config
      );

      return response.data;
    } catch (error) {
      console.error('Update store status error:', error);
      if (error.response) {
        return rejectWithValue(
          error.response.data?.message || 
          error.response.data?.error || 
          'Failed to update store status'
        );
      }
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Get store public info (for frontend display)
export const getStorePublicInfo = createAsyncThunk(
  'store/getStorePublicInfo',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/store/info`
      );

      return response.data;
    } catch (error) {
      console.error('Get store public info error:', error);
      if (error.response) {
        return rejectWithValue(
          error.response.data?.message || 
          error.response.data?.error || 
          'Failed to fetch store information'
        );
      }
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

const storeSlice = createSlice({
  name: "store",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setStoreOpen: (state, action) => {
      state.isStoreOpen = action.payload;
    },
    updateStoreSettingsLocal: (state, action) => {
      state.storeSettings = { ...state.storeSettings, ...action.payload };
    },
    resetStoreSettings: (state) => {
      state.storeSettings = initialState.storeSettings;
      state.isStoreOpen = true;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch store settings
      .addCase(fetchStoreSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStoreSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.storeSettings = { ...state.storeSettings, ...action.payload.settings };
        state.isStoreOpen = action.payload.isStoreOpen;
      })
      .addCase(fetchStoreSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update store settings
      .addCase(updateStoreSettings.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateStoreSettings.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.storeSettings = { ...state.storeSettings, ...action.payload.settings };
      })
      .addCase(updateStoreSettings.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })
      
      // Update store logo
      .addCase(updateStoreLogo.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateStoreLogo.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.storeSettings.logo = action.payload.logoUrl;
      })
      .addCase(updateStoreLogo.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })
      
      // Update store status
      .addCase(updateStoreStatus.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateStoreStatus.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.isStoreOpen = action.payload.isStoreOpen;
      })
      .addCase(updateStoreStatus.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })
      
      // Get store public info
      .addCase(getStorePublicInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStorePublicInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.storeSettings = { ...state.storeSettings, ...action.payload.settings };
        state.isStoreOpen = action.payload.isStoreOpen;
      })
      .addCase(getStorePublicInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  setStoreOpen, 
  updateStoreSettingsLocal, 
  resetStoreSettings 
} = storeSlice.actions;

export default storeSlice.reducer;