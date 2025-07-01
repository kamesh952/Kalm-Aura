import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import productReducer from "./slices/ProductSlice";
import cartReducer from "./slices/cartSlice";
import checkoutReducer from "./slices/checkoutSlice";
import orderReducer from "./slices/orderSlice";
import adminReducer from "./slices/adminSlice";
import adminProductReducer from "./slices/adminProductSlice";
import adminOrderReducer from "./slices/adminOrderSlice";
import newsletterReducer from "./slices/subscribeslice";
import uploadReducer from "./slices/uploadslice";

const store = configureStore({
  reducer: {
    auth: authReducer,               // Handles user authentication
    products: productReducer,         // Manages product data
    cart: cartReducer,               // Shopping cart functionality
    checkout: checkoutReducer,       // Checkout process
    orders: orderReducer,            // Order management
    admin: adminReducer,             // Admin dashboard
    adminProducts: adminProductReducer, // Admin product management
    adminOrders: adminOrderReducer,   // Admin order management
    newsletter: newsletterReducer,    // Newsletter subscriptions
    upload: uploadReducer,           // Image uploads
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,      // Disabled for file uploads
    }),
});

export default store;