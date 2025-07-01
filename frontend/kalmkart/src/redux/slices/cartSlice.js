import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Helper functions for localStorage persistence
const loadCartFromStorage = () => {
  try {
    const storedCart = localStorage.getItem('cart');
    return storedCart ? JSON.parse(storedCart) : { products: [], totalPrice: 0 };
  } catch (error) {
    console.error('Failed to parse cart from localStorage', error);
    return { products: [], totalPrice: 0 };
  }
};

const saveCartToStorage = (cart) => {
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
  } catch (error) {
    console.error('Failed to save cart to localStorage', error);
  }
};

// Helper to create axios config with auth headers
const getAxiosConfig = (getState) => {
  const { auth } = getState();
  const config = {
    timeout: 10000,
    headers: {}
  };
  
  if (auth.user?.token) {
    config.headers.Authorization = `Bearer ${auth.user.token}`;
  }
  
  return config;
};

// Async Thunks for API operations
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async ({ userId, guestId }, { rejectWithValue, getState }) => {
    try {
      if (!userId && !guestId) {
        return { products: [], totalPrice: 0 };
      }

      const config = getAxiosConfig(getState);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/cart`,
        {
          ...config,
          params: { userId, guestId }
        }
      );
      
      return response.data.cart || { products: [], totalPrice: 0 };
    } catch (error) {
      console.error('Fetch cart error:', error);
      
      // If cart not found, return empty cart instead of error
      if (error.response?.status === 404) {
        return { products: [], totalPrice: 0 };
      }
      
      return rejectWithValue(
        error.response?.data?.message || 'Failed to load cart'
      );
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity = 1, size, color, userId, guestId }, { rejectWithValue, getState }) => {
    try {
      if (!productId || !size || !color) {
        throw new Error('Product ID, size, and color are required');
      }

      if (quantity <= 0) {
        throw new Error('Quantity must be at least 1');
      }

      const config = getAxiosConfig(getState);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/cart`,
        { productId, quantity, size, color, userId, guestId },
        config
      );
      
      return response.data.cart;
    } catch (error) {
      console.error('Add to cart error:', error);
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to add item to cart'
      );
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateItem',
  async ({ productId, quantity, size, color, userId, guestId }, { rejectWithValue, getState }) => {
    try {
      if (!productId || !size || !color) {
        throw new Error('Product ID, size, and color are required');
      }

      const config = getAxiosConfig(getState);
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/cart`,
        { productId, quantity, size, color, userId, guestId },
        config
      );
      
      return response.data.cart;
    } catch (error) {
      console.error('Update cart item error:', error);
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update item quantity'
      );
    }
  }
);

export const removeCartItem = createAsyncThunk(
  'cart/removeItem',
  async ({ productId, size, color, userId, guestId }, { rejectWithValue, getState }) => {
    try {
      if (!productId || !size || !color) {
        throw new Error('Product ID, size, and color are required');
      }

      const config = getAxiosConfig(getState);
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/cart`,
        {
          ...config,
          data: { productId, size, color, userId, guestId }
        }
      );
      
      return response.data.cart || { products: [], totalPrice: 0 };
    } catch (error) {
      console.error('Remove item failed:', error);
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to remove item'
      );
    }
  }
);

export const mergeCarts = createAsyncThunk(
  'cart/merge',
  async ({ guestId }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      if (!auth.user) {
        throw new Error('User not authenticated');
      }

      const config = getAxiosConfig(getState);
      
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/cart/merge`,
        { guestId },
        config
      );
      
      // Return the merged cart
      return response.data.cart || { products: [], totalPrice: 0 };
    } catch (error) {
      console.error('Merge carts error:', error);
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to merge carts'
      );
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async ({ userId, guestId }, { rejectWithValue, getState }) => {
    try {
      const { cart } = getState().cart;
      
      if (cart.products && cart.products.length > 0) {
        // Remove all items from backend one by one
        const config = getAxiosConfig(getState);
        const removePromises = cart.products.map(item =>
          axios.delete(
            `${import.meta.env.VITE_BACKEND_URL}/api/cart`,
            {
              ...config,
              data: {
                productId: item.productId,
                size: item.size,
                color: item.color,
                userId,
                guestId
              }
            }
          )
        );
        
        await Promise.all(removePromises);
      }
      
      return { products: [], totalPrice: 0 };
    } catch (error) {
      console.error('Clear cart error:', error);
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to clear cart'
      );
    }
  }
);

const initialState = {
  cart: loadCartFromStorage(),
  loading: false,
  error: null,
  lastUpdated: null,
  itemLoading: {}, // Track loading state for individual items
  isMerging: false // Track merge operation state
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearLocalCart: (state) => {
      state.cart = { products: [], totalPrice: 0 };
      state.error = null;
      state.itemLoading = {};
      saveCartToStorage(state.cart);
    },
    clearCartError: (state) => {
      state.error = null;
    },
    setGuestCart: (state, action) => {
      state.cart = action.payload;
      saveCartToStorage(action.payload);
    },
    setItemLoading: (state, action) => {
      const { itemKey, loading } = action.payload;
      state.itemLoading[itemKey] = loading;
    },
    // Local cart operations for better UX (optimistic updates)
    updateLocalCartItem: (state, action) => {
      const { productId, size, color, quantity } = action.payload;
      const itemIndex = state.cart.products.findIndex(
        item => item.productId === productId && 
                item.size === size && 
                item.color === color
      );
      
      if (itemIndex !== -1) {
        if (quantity > 0) {
          state.cart.products[itemIndex].quantity = quantity;
        } else {
          state.cart.products.splice(itemIndex, 1);
        }
        
        // Recalculate total price
        state.cart.totalPrice = state.cart.products.reduce(
          (acc, item) => acc + (parseFloat(item.price) * parseInt(item.quantity)),
          0
        );
        
        saveCartToStorage(state.cart);
      }
    },
    removeLocalCartItem: (state, action) => {
      const { productId, size, color } = action.payload;
      state.cart.products = state.cart.products.filter(
        item => !(item.productId === productId && 
                 item.size === size && 
                 item.color === color)
      );
      
      // Recalculate total price
      state.cart.totalPrice = state.cart.products.reduce(
        (acc, item) => acc + (parseFloat(item.price) * parseInt(item.quantity)),
        0
      );
      
      saveCartToStorage(state.cart);
    },
    // Add a reducer to handle pre-merge cart preservation
    preserveGuestCart: (state) => {
      // This can be called before login to ensure guest cart is preserved
      const currentCart = { ...state.cart };
      localStorage.setItem('guestCartBackup', JSON.stringify(currentCart));
    },
    // Add a reducer to restore guest cart if merge fails
    restoreGuestCart: (state) => {
      try {
        const backupCart = localStorage.getItem('guestCartBackup');
        if (backupCart) {
          state.cart = JSON.parse(backupCart);
          saveCartToStorage(state.cart);
          localStorage.removeItem('guestCartBackup');
        }
      } catch (error) {
        console.error('Failed to restore guest cart:', error);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
        state.lastUpdated = new Date().toISOString();
        saveCartToStorage(action.payload);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch cart';
      })
      
      // Add to cart
      .addCase(addToCart.pending, (state, action) => {
        const { productId, size, color } = action.meta.arg;
        const itemKey = `${productId}-${size}-${color}`;
        state.itemLoading[itemKey] = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        const { productId, size, color } = action.meta.arg;
        const itemKey = `${productId}-${size}-${color}`;
        state.itemLoading[itemKey] = false;
        state.cart = action.payload;
        state.lastUpdated = new Date().toISOString();
        saveCartToStorage(action.payload);
      })
      .addCase(addToCart.rejected, (state, action) => {
        const { productId, size, color } = action.meta.arg;
        const itemKey = `${productId}-${size}-${color}`;
        state.itemLoading[itemKey] = false;
        state.error = action.payload || 'Failed to add item to cart';
      })
      
      // Update cart item
      .addCase(updateCartItem.pending, (state, action) => {
        const { productId, size, color } = action.meta.arg;
        const itemKey = `${productId}-${size}-${color}`;
        state.itemLoading[itemKey] = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        const { productId, size, color } = action.meta.arg;
        const itemKey = `${productId}-${size}-${color}`;
        state.itemLoading[itemKey] = false;
        state.cart = action.payload;
        state.lastUpdated = new Date().toISOString();
        saveCartToStorage(action.payload);
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        const { productId, size, color } = action.meta.arg;
        const itemKey = `${productId}-${size}-${color}`;
        state.itemLoading[itemKey] = false;
        state.error = action.payload || 'Failed to update item';
      })
      
      // Remove cart item
      .addCase(removeCartItem.pending, (state, action) => {
        const { productId, size, color } = action.meta.arg;
        const itemKey = `${productId}-${size}-${color}`;
        state.itemLoading[itemKey] = true;
        state.error = null;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        const { productId, size, color } = action.meta.arg;
        const itemKey = `${productId}-${size}-${color}`;
        state.itemLoading[itemKey] = false;
        state.cart = action.payload;
        state.lastUpdated = new Date().toISOString();
        saveCartToStorage(action.payload);
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        const { productId, size, color } = action.meta.arg;
        const itemKey = `${productId}-${size}-${color}`;
        state.itemLoading[itemKey] = false;
        state.error = action.payload || 'Failed to remove item';
      })
      
      // Merge carts
      .addCase(mergeCarts.pending, (state) => {
        state.isMerging = true;
        state.error = null;
      })
      .addCase(mergeCarts.fulfilled, (state, action) => {
        state.isMerging = false;
        state.cart = action.payload;
        state.lastUpdated = new Date().toISOString();
        saveCartToStorage(action.payload);
        // Clean up guest cart backup after successful merge
        localStorage.removeItem('guestCartBackup');
      })
      .addCase(mergeCarts.rejected, (state, action) => {
        state.isMerging = false;
        state.error = action.payload || 'Failed to merge carts';
      })
      
      // Clear cart
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
        state.itemLoading = {};
        state.lastUpdated = new Date().toISOString();
        saveCartToStorage(action.payload);
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to clear cart';
      });
  },
});

export const {
  clearLocalCart,
  clearCartError,
  setGuestCart,
  setItemLoading,
  updateLocalCartItem,
  removeLocalCartItem,
  preserveGuestCart,
  restoreGuestCart
} = cartSlice.actions;

// Selectors
export const selectCart = (state) => state.cart.cart;
export const selectCartItems = (state) => state.cart.cart.products || [];
export const selectCartTotal = (state) => state.cart.cart.totalPrice || 0;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartError = (state) => state.cart.error;
export const selectItemLoading = (state) => state.cart.itemLoading;
export const selectIsMerging = (state) => state.cart.isMerging;
export const selectCartItemCount = (state) => {
  const items = state.cart.cart.products || [];
  return items.reduce((total, item) => total + parseInt(item.quantity), 0);
};
export const selectCartLastUpdated = (state) => state.cart.lastUpdated;

// Helper selector to check if a specific item is loading
export const selectIsItemLoading = (state, productId, size, color) => {
  const itemKey = `${productId}-${size}-${color}`;
  return state.cart.itemLoading[itemKey] || false;
};

export default cartSlice.reducer;