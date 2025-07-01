import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}`;

// Helper function to get auth headers
const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("userToken")}`,
});

// Fetch all orders (admin only)
export const fetchAllOrders = createAsyncThunk(
  "adminOrders/fetchAllOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/admin/orders`,
        {
          headers: getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// Get order by ID
export const getOrderById = createAsyncThunk(
  "adminOrders/getOrderById",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/admin/orders/${orderId}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// Update order status
export const updateOrderStatus = createAsyncThunk(
  "adminOrders/updateOrderStatus",
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/admin/orders/${orderId}/status`,
        { status },
        {
          headers: getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// Delete an order
export const deleteOrder = createAsyncThunk(
  "adminOrders/deleteOrder",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${API_URL}/api/admin/orders/${id}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return id; // Return the deleted order's ID
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// Get orders by status
export const getOrdersByStatus = createAsyncThunk(
  "adminOrders/getOrdersByStatus",
  async (status, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/admin/orders?status=${status}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// Get orders analytics/statistics
export const getOrdersAnalytics = createAsyncThunk(
  "adminOrders/getOrdersAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/admin/orders/analytics`,
        {
          headers: getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

const adminOrdersSlice = createSlice({
  name: "adminOrders",
  initialState: {
    orders: [],
    currentOrder: null,
    totalOrders: 0,
    totalSales: 0,
    loading: false,
    error: null,
    analytics: {
      totalRevenue: 0,
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      monthlyRevenue: [],
      topProducts: [],
    },
    filters: {
      status: 'all',
      dateRange: null,
    },
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearOrders: (state) => {
      state.orders = [];
      state.totalOrders = 0;
      state.totalSales = 0;
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        status: 'all',
        dateRange: null,
      };
    },
    // Calculate total sales from orders
    calculateTotalSales: (state) => {
      const totalSales = state.orders.reduce((acc, order) => {
        if (order.status === 'completed' || order.status === 'delivered') {
          return acc + (order.totalPrice || order.totalAmount || 0);
        }
        return acc;
      }, 0);
      state.totalSales = totalSales;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all orders cases
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders || action.payload;
        state.totalOrders = action.payload.totalOrders || action.payload.length;
        
        // Calculate total sales from completed orders
        const totalSales = state.orders.reduce((acc, order) => {
          if (order.status === 'completed' || order.status === 'delivered') {
            return acc + (order.totalPrice || order.totalAmount || 0);
          }
          return acc;
        }, 0);
        state.totalSales = totalSales;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get order by ID cases
      .addCase(getOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(getOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update order status cases
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedOrder = action.payload;
        const orderIndex = state.orders.findIndex(
          (order) => order._id === updatedOrder._id
        );
        if (orderIndex !== -1) {
          state.orders[orderIndex] = updatedOrder;
        }
        // Update current order if it's the same one
        if (state.currentOrder && state.currentOrder._id === updatedOrder._id) {
          state.currentOrder = updatedOrder;
        }
        // Recalculate total sales
        const totalSales = state.orders.reduce((acc, order) => {
          if (order.status === 'completed' || order.status === 'delivered') {
            return acc + (order.totalPrice || order.totalAmount || 0);
          }
          return acc;
        }, 0);
        state.totalSales = totalSales;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete order cases
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading = false;
        const deletedOrderId = action.payload;
        const deletedOrder = state.orders.find(order => order._id === deletedOrderId);
        
        state.orders = state.orders.filter(
          (order) => order._id !== deletedOrderId
        );
        state.totalOrders -= 1;
        
        // Adjust total sales if deleted order was completed
        if (deletedOrder && (deletedOrder.status === 'completed' || deletedOrder.status === 'delivered')) {
          state.totalSales -= (deletedOrder.totalPrice || deletedOrder.totalAmount || 0);
        }
        
        // Clear current order if it was the deleted one
        if (state.currentOrder && state.currentOrder._id === deletedOrderId) {
          state.currentOrder = null;
        }
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get orders by status cases
      .addCase(getOrdersByStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrdersByStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders || action.payload;
        state.totalOrders = action.payload.totalOrders || action.payload.length;
      })
      .addCase(getOrdersByStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get orders analytics cases
      .addCase(getOrdersAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrdersAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = { ...state.analytics, ...action.payload };
      })
      .addCase(getOrdersAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearOrders,
  setCurrentOrder,
  clearCurrentOrder,
  setFilters,
  clearFilters,
  calculateTotalSales,
} = adminOrdersSlice.actions;

export default adminOrdersSlice.reducer;