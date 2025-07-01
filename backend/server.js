const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Route imports
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const orderRoutes = require("./routes/orderRoutes");
const uploadRoutes = require("./routes/uploadRoutes"); // ✅ Upload route
const subscribeRoutes = require("./routes/subsciberRoute"); // ✅ Upload route
const adminRoutes = require("./routes/adminRoutes"); // ✅ Upload route
const adminProductRoutes = require("./routes/adminProductRoutes"); // ✅ Upload route
const adminOrderRoutes = require("./routes/adminOrderRoutes"); // ✅ Upload route


// Load .env variables
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

// Middlewares
app.use(cors());
app.use(express.json()); // Body parser



// Serve static files from public/images
app.use("/images", express.static("public/images"));



// Mount routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes); // ✅ Correct path
app.use("/api", subscribeRoutes); 

//Admin
app.use("/api/admin/users", adminRoutes); 
app.use("/api/admin/products", adminProductRoutes); 
app.use("/api/admin/orders", adminOrderRoutes); 


// Root route (for health check)
app.get("/", (req, res) => {
  res.send("WELCOME TO RABBIT API!");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
