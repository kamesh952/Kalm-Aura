import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/admin/users`;

// Helper function to ensure array response
const ensureArray = (data) => (Array.isArray(data) ? data : []);

// Configure axios defaults for authentication
const getAxiosConfig = () => {
  const token = localStorage.getItem('userToken'); // Adjust based on your auth implementation
  return {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };
};

export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_BASE_URL, getAxiosConfig());
      return ensureArray(response.data);
    } catch (err) {
      return rejectWithValue({
        message: err.response?.data?.message || 'Failed to fetch users',
        status: err.response?.status
      });
    }
  }
);

export const addUser = createAsyncThunk(
  'admin/addUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_BASE_URL, userData, getAxiosConfig());
      // API returns { message, user } - extract the user object
      return response.data.user;
    } catch (err) {
      return rejectWithValue({
        message: err.response?.data?.message || 'Failed to add user',
        status: err.response?.status
      });
    }
  }
);

export const updateUser = createAsyncThunk(
  'admin/updateUser',
  async ({ id, ...userData }, { rejectWithValue }) => {
    try {
      // Changed from PATCH to PUT to match your API route
      const response = await axios.put(`${API_BASE_URL}/${id}`, userData, getAxiosConfig());
      // API returns { message, user } - extract the user object
      return response.data.user;
    } catch (err) {
      return rejectWithValue({
        message: err.response?.data?.message || 'Failed to update user',
        status: err.response?.status
      });
    }
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/${userId}`, getAxiosConfig());
      // API returns { message } - return the userId for state update
      return userId;
    } catch (err) {
      return rejectWithValue({
        message: err.response?.data?.message || 'Failed to delete user',
        status: err.response?.status
      });
    }
  }
);

const initialState = {
  users: [],
  loading: false,
  error: null,
  success: false,
  successMessage: null,
  totalUsers: 0, // Added to track total user count
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.successMessage = null;
    },
    resetUsers: (state) => {
      state.users = [];
      state.totalUsers = 0;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch Users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = ensureArray(action.payload);
        state.totalUsers = state.users.length;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add User
    builder
      .addCase(addUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.successMessage = null;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
        state.totalUsers = state.users.length;
        state.success = true;
        state.successMessage = "User created successfully";
        state.error = null;
      })
      .addCase(addUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });

    // Update User
    builder
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.successMessage = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        // Use _id for MongoDB or id for other databases
        const index = state.users.findIndex(user => 
          user._id === action.payload._id || user.id === action.payload.id
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        state.success = true;
        state.successMessage = "User updated successfully";
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });

    // Delete User
    builder
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.successMessage = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        // Filter out the deleted user using the returned userId
        state.users = state.users.filter(user => 
          user._id !== action.payload && user.id !== action.payload
        );
        state.totalUsers = state.users.length;
        state.success = true;
        state.successMessage = "User deleted successfully";
        state.error = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  }
});

export const { 
  clearAdminState, 
  resetUsers, 
  clearError, 
  clearSuccess 
} = adminSlice.actions;

// Selectors
export const selectAllUsers = (state) => ensureArray(state.admin.users);
export const selectAdminLoading = (state) => state.admin.loading;
export const selectAdminError = (state) => state.admin.error;
export const selectAdminSuccess = (state) => state.admin.success;
export const selectAdminSuccessMessage = (state) => state.admin.successMessage;
export const selectTotalUsers = (state) => state.admin.totalUsers;

export default adminSlice.reducer;