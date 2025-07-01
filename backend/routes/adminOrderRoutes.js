const express = require("express");
const Order = require("../models/Order");
const { protect, admin } = require("../middleware/authmiddleware");

const router = express.Router();

// @route GET /api/admin/orders
// @desc Get all orders (Admin only) with optional status filter
// @access Private/Admin
router.get("/", protect, admin, async (req, res) => {
  try {
    const { status } = req.query;
    
    // Build query based on status filter
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 }); // Sort by newest first
    
    res.json({
      orders,
      totalOrders: orders.length,
      message: "Orders fetched successfully"
    });
  } catch (error) {
    console.error("Get Orders Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route GET /api/admin/orders/analytics
// @desc Get orders analytics/statistics
// @access Private/Admin
router.get("/analytics", protect, admin, async (req, res) => {
  try {
    // Get all orders for analytics
    const allOrders = await Order.find({});
    
    // Calculate analytics
    const totalOrders = allOrders.length;
    const totalRevenue = allOrders
      .filter(order => order.status === 'completed' || order.status === 'delivered')
      .reduce((acc, order) => acc + (order.totalPrice || order.totalAmount || 0), 0);
    
    const pendingOrders = allOrders.filter(order => order.status === 'pending').length;
    const completedOrders = allOrders.filter(order => order.status === 'completed' || order.status === 'delivered').length;
    const cancelledOrders = allOrders.filter(order => order.status === 'cancelled').length;
    
    // Calculate monthly revenue (last 12 months)
    const monthlyRevenue = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);
      
      const monthOrders = allOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= monthStart && orderDate <= monthEnd && 
               (order.status === 'completed' || order.status === 'delivered');
      });
      
      const monthRevenue = monthOrders.reduce((acc, order) => 
        acc + (order.totalPrice || order.totalAmount || 0), 0
      );
      
      monthlyRevenue.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue,
        orders: monthOrders.length
      });
    }
    
    // Get top products (you'll need to implement based on your order items structure)
    const topProducts = []; // Implement based on your order items schema
    
    res.json({
      totalRevenue,
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      monthlyRevenue,
      topProducts
    });
  } catch (error) {
    console.error("Get Analytics Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route GET /api/admin/orders/:id
// @desc Get order by ID
// @access Private/Admin
router.get("/:id", protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email");
    
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    console.error("Get Order by ID Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route PUT /api/admin/orders/:id/status
// @desc Update order status
// @access Private/Admin
router.put("/:id/status", protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (order) {
      const { status } = req.body;
      
      // Validate status
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'completed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      order.status = status;
      
      // Update delivery status based on status
      if (status === "delivered") {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
      }
      
      const updatedOrder = await order.save();
      await updatedOrder.populate("user", "name email");
      
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    console.error("Update Order Status Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route PUT /api/admin/orders/:id
// @desc Update order (general update - for backward compatibility)
// @access Private/Admin
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (order) {
      order.status = req.body.status || order.status;
      order.isDelivered = req.body.status === "delivered" ? true : order.isDelivered;
      order.deliveredAt = req.body.status === "delivered" ? Date.now() : order.deliveredAt;

      const updatedOrder = await order.save();
      await updatedOrder.populate("user", "name email");
      
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    console.error("Update Order Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route DELETE /api/admin/orders/:id
// @desc Delete an order
// @access Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      await Order.findByIdAndDelete(req.params.id);
      res.json({ 
        message: "Order removed successfully",
        orderId: req.params.id
      });
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    console.error("Delete Order Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;