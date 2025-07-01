const express = require("express");
const Order = require("../models/Order");
const { protect } = require("../middleware/authmiddleware");

const router = express.Router();

// @route   GET /api/orders/my-orders
// @desc    Get all orders placed by the currently authenticated user
// @access  Private
// IMPROVED MY-ORDERS ROUTE WITH BETTER ERROR HANDLING
router.get("/my-orders", protect, async (req, res) => {
  try {
    console.log("=== FETCHING ORDERS FOR USER ===");
    console.log("User ID:", req.user._id);

    // First, get orders without populate to see raw data
    const rawOrders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    console.log("Found orders:", rawOrders.length);
    
    rawOrders.forEach((order, index) => {
      console.log(`Order ${index} (${order._id}):`);
      console.log("- orderItems:", order.orderItems);
      console.log("- OrderItems:", order.OrderItems);
      console.log("- items:", order.items);
    });

    // Try different populate paths based on your schema
    let orders;
    try {
      orders = await Order.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .populate("orderItems.productId", "name image price");
    } catch (populateError) {
      console.log("Failed to populate orderItems.productId, trying alternatives...");
      console.error("Populate error:", populateError.message);
      
      // Try alternative field names
      try {
        orders = await Order.find({ user: req.user._id })
          .sort({ createdAt: -1 })
          .populate("OrderItems.productId", "name image price");
      } catch (altError) {
        console.log("Failed OrderItems.productId, returning raw orders");
        orders = rawOrders;
      }
    }

    console.log("=== FINAL ORDERS RESPONSE ===");
    console.log("Orders count:", orders.length);
    orders.forEach((order, index) => {
      console.log(`Order ${index}: ${order.orderItems?.length || 0} items`);
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error("=== ERROR FETCHING ORDERS ===");
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order details by ID
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Return the full order details
    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
