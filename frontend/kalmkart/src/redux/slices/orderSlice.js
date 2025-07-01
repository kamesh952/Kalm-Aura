import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { finalizeCheckout } from "./checkoutSlice";

// 🔁 Async Thunks (remain unchanged)
export const fetchUserOrders = createAsyncThunk(
  "orders/fetchUserOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/orders/my-orders`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user orders"
      );
    }
  }
);

export const fetchOrderDetails = createAsyncThunk(
  "orders/fetchOrderDetails",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch order details"
      );
    }
  }
);

export const fetchMissingProductDetails = createAsyncThunk(
  "orders/fetchMissingProductDetails",
  async (productIds, { rejectWithValue, getState }) => {
    try {
      const { productCache } = getState().orders;
      
      const productIdsArray = Array.isArray(productIds) ? productIds : Array.from(productIds);
      const missingProductIds = productIdsArray.filter(id => !productCache[id]);
      
      if (missingProductIds.length === 0) return {};
      
      const productPromises = missingProductIds.map(async (productId) => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/products/${productId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("userToken")}`,
              },
            }
          );
          return { productId, productData: response.data };
        } catch (error) {
          console.error(`Failed to fetch product ${productId}:`, error);
          return { productId, productData: null };
        }
      });
      
      const results = await Promise.all(productPromises);
      const productMap = {};
      results.forEach(({ productId, productData }) => {
        if (productData) productMap[productId] = productData;
      });
      
      return productMap;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch product details"
      );
    }
  }
);

// Helper functions (remain unchanged)
const extractProductIdsFromOrders = (orders) => {
  const productIds = [];
  orders.forEach(order => {
    const items = order.orderItems || order.OrderItems || order.items || [];
    items.forEach(item => {
      const productId = item.productId?._id || item.productId || item.product?._id || item.product;
      if (productId && typeof productId === 'string' && !productIds.includes(productId)) {
        productIds.push(productId);
      }
    });
  });
  return productIds;
};

const isProductPopulated = (item) => {
  const productRef = item.productId || item.product;
  return productRef && typeof productRef === 'object' && productRef.name;
};

// 🧩 Orders Slice with minimal changes
const orderSlice = createSlice({
  name: "orders",
  initialState: {
    userOrders: [],
    loading: false,
    errorOrders: null,
    orderDetails: null,
    loadingDetails: false,
    errorDetails: null,
    latestOrder: null,
    productCache: {},
    loadingProducts: false,
    errorProducts: null,
    pendingProductFetches: [],
  },
  reducers: {
    clearOrderErrors: (state) => {
      state.errorOrders = null;
      state.errorDetails = null;
      state.errorProducts = null;
    },
    clearOrderDetails: (state) => {
      state.orderDetails = null;
      state.errorDetails = null;
    },
    clearLatestOrder: (state, action) => {
      // Only clear if explicitly requested
      if (action.payload === true) {
        state.latestOrder = null;
      }
    },
    // ... (keep all other existing reducers exactly the same)
    addOrderToList: (state, action) => {
      state.userOrders.unshift(action.payload);
    },
    updateOrderInList: (state, action) => {
      const index = state.userOrders.findIndex(order => order._id === action.payload._id);
      if (index !== -1) {
        state.userOrders[index] = { ...state.userOrders[index], ...action.payload };
      }
    },
    clearProductCache: (state) => {
      state.productCache = {};
    },
    cacheProductData: (state, action) => {
      const { productId, productData } = action.payload;
      state.productCache[productId] = productData;
    },
    addPendingProductFetch: (state, action) => {
      if (!state.pendingProductFetches.includes(action.payload)) {
        state.pendingProductFetches.push(action.payload);
      }
    },
    removePendingProductFetch: (state, action) => {
      state.pendingProductFetches = state.pendingProductFetches.filter(
        id => id !== action.payload
      );
    }
  },
  extraReducers: (builder) => {
    builder
      // ... (keep all other existing extraReducers exactly the same)
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.errorOrders = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.userOrders = action.payload;
        state.errorOrders = null;
        const productIds = extractProductIdsFromOrders(action.payload);
        state.pendingProductFetches = productIds.filter(
          id => !state.productCache[id]
        );
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.errorOrders = action.payload;
      })
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loadingDetails = true;
        state.errorDetails = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loadingDetails = false;
        state.orderDetails = action.payload;
        state.errorDetails = null;
        const productIds = extractProductIdsFromOrders([action.payload]);
        productIds.forEach(id => {
          if (!state.productCache[id] && !state.pendingProductFetches.includes(id)) {
            state.pendingProductFetches.push(id);
          }
        });
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loadingDetails = false;
        state.errorDetails = action.payload;
      })
      .addCase(fetchMissingProductDetails.pending, (state) => {
        state.loadingProducts = true;
        state.errorProducts = null;
      })
      .addCase(fetchMissingProductDetails.fulfilled, (state, action) => {
        state.loadingProducts = false;
        state.productCache = { ...state.productCache, ...action.payload };
        state.pendingProductFetches = state.pendingProductFetches.filter(
          id => !action.payload[id]
        );
      })
      .addCase(fetchMissingProductDetails.rejected, (state, action) => {
        state.loadingProducts = false;
        state.errorProducts = action.payload;
      })
      .addCase(finalizeCheckout.fulfilled, (state, action) => {
        // Modified to handle nested response
        const orderData = action.payload.order || action.payload;
        
        if (orderData && (orderData._id || orderData.orderItems)) {
          state.latestOrder = orderData;
          
          if (orderData._id) {
            const existingIndex = state.userOrders.findIndex(
              order => order._id === orderData._id
            );
            
            if (existingIndex === -1) {
              state.userOrders.unshift(orderData);
            } else {
              state.userOrders[existingIndex] = orderData;
            }
            
            const productIds = extractProductIdsFromOrders([orderData]);
            productIds.forEach(id => {
              if (!state.productCache[id] && !state.pendingProductFetches.includes(id)) {
                state.pendingProductFetches.push(id);
              }
            });
          }
        }
      });
  },
});

// Export actions (remain unchanged)
export const { 
  clearOrderErrors, 
  clearOrderDetails, 
  clearLatestOrder,
  addOrderToList,
  updateOrderInList,
  clearProductCache,
  cacheProductData,
  addPendingProductFetch,
  removePendingProductFetch
} = orderSlice.actions;

// Selectors (remain exactly the same)
export const selectUserOrders = (state) => state.orders.userOrders;
export const selectOrdersLoading = (state) => state.orders.loading;
export const selectOrdersError = (state) => state.orders.errorOrders;

export const selectOrderDetails = (state) => state.orders.orderDetails;
export const selectOrderDetailsLoading = (state) => state.orders.loadingDetails;
export const selectOrderDetailsError = (state) => state.orders.errorDetails;

export const selectLatestOrder = (state) => state.orders.latestOrder;
export const selectProductCache = (state) => state.orders.productCache;
export const selectProductsLoading = (state) => state.orders.loadingProducts;
export const selectProductsError = (state) => state.orders.errorProducts;

export const selectPendingProductFetches = (state) => state.orders.pendingProductFetches;
export const selectHasMissingProductData = (state) => state.orders.pendingProductFetches.length > 0;

export const selectOrdersWithProductData = (state) => {
  const { userOrders, productCache } = state.orders;
  return userOrders.map(order => ({
    ...order,
    orderItems: (order.orderItems || order.OrderItems || order.items || []).map(item => {
      const productId = item.productId?._id || item.productId || item.product?._id || item.product;
      const productData = isProductPopulated(item) 
        ? (item.productId || item.product)
        : productCache[productId];
      return {
        ...item,
        productId: productData || { 
          _id: productId, 
          name: item.name || 'Unknown Product',
          price: item.price || 0,
          image: item.image || '/placeholder.png'
        }
      };
    })
  }));
};

export const selectOrderDetailsWithProductData = (state) => {
  const orderDetails = state.orders.orderDetails;
  if (!orderDetails) return null;
  const { productCache } = state.orders;
  return {
    ...orderDetails,
    orderItems: (orderDetails.orderItems || orderDetails.OrderItems || orderDetails.items || []).map(item => {
      const productId = item.productId?._id || item.productId || item.product?._id || item.product;
      const productData = isProductPopulated(item) 
        ? (item.productId || item.product)
        : productCache[productId];
      return {
        ...item,
        productId: productData || { 
          _id: productId, 
          name: item.name || 'Unknown Product',
          price: item.price || 0,
          image: item.image || '/placeholder.png'
        }
      };
    })
  };
};

export default orderSlice.reducer;