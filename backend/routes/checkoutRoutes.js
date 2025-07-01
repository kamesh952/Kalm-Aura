// checkout.js
const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Products");
const { protect, admin } = require("../middleware/authmiddleware");
const Checkout = require("../models/Checkout");
const Order = require("../models/Order");
const mongoose = require("mongoose");

// @route   POST /api/checkout
// @desc    Create a new checkout session
// @access  Private
router.post("/", protect, async (req, res) => {
  const { checkoutItems, shippingAddress, paymentMethod, totalPrice } =
    req.body;

  if (!checkoutItems || checkoutItems.length === 0) {
    return res.status(400).json({ message: "No items in checkout" });
  }

  if (
    !shippingAddress ||
    !shippingAddress.address ||
    !shippingAddress.city ||
    !shippingAddress.postalCode ||
    !shippingAddress.country
  ) {
    return res.status(400).json({ message: "Incomplete shipping address" });
  }

  try {
    const newCheckout = await Checkout.create({
      user: req.user._id,
      checkoutItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      paymentStatus: "Pending",
      isPaid: false,
    });

    console.log("Checkout created");
    res.status(201).json(newCheckout);
  } catch (error) {
    console.error("Error creating checkout:", error);
    res.status(500).json({ message: "Server error creating checkout" });
  }
});

router.put("/:id/pay", protect, async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid checkout ID" });
  }

  const { paymentStatus, paymentDetails } = req.body;

  try {
    const checkout = await Checkout.findById(id);

    if (!checkout) {
      return res.status(404).json({ message: "Checkout not found" });
    }

    if (paymentStatus === "Paid") {
      checkout.isPaid = true;
      checkout.paymentStatus = paymentStatus;
      checkout.paymentDetails = paymentDetails;
      checkout.paidAt = Date.now();

      await checkout.save();
      res.status(200).json(checkout);
    } else {
      res.status(400).json({ message: "Invalid Payment Status" });
    }
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({ message: "Server error updating payment status" });
  }
});
// Add this to your orders route file temporarily

// DEBUG ROUTE - Remove after debugging
router.get("/debug/:orderId", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    console.log("=== RAW ORDER DATA ===");
    console.log(JSON.stringify(order, null, 2));

    console.log("=== ORDER ITEMS FIELD ===");
    console.log("orderItems:", order.orderItems);
    console.log("OrderItems:", order.OrderItems);
    console.log("items:", order.items);

    res.json({
      rawOrder: order,
      orderItemsField: order.orderItems,
      OrderItemsField: order.OrderItems,
      itemsField: order.items,
      allFields: Object.keys(order.toObject()),
    });
  } catch (error) {
    console.error("Debug error:", error);
    res.status(500).json({ error: error.message });
  }
});
router.post("/:id/finalize", protect, async (req, res) => {
  try {
    // 1. Find and validate the checkout
    const checkout = await Checkout.findById(req.params.id).populate({
      path: "checkoutItems.productId",
      select: "name price image images",
    });

    if (!checkout) {
      return res.status(404).json({ message: "Checkout not found" });
    }

    if (checkout.isFinalized) {
      return res.status(400).json({ message: "Checkout already finalized" });
    }

    if (!checkout.isPaid) {
      return res.status(400).json({ message: "Checkout is not paid" });
    }

    if (!checkout.checkoutItems || checkout.checkoutItems.length === 0) {
      return res.status(400).json({ message: "No checkout items found" });
    }

    // 2. Transform checkout items to order items with images
    const orderItems = checkout.checkoutItems.map((item) => {
      // Use the populated product data if available
      const product = item.productId || {};

      return {
        productId: product._id || item.productId,
        name: product.name || item.name || "Unknown Product",
        qty: item.quantity || 1,
        price: item.price || product.price || 0,
        // Handle both single image and image arrays
        image:
          product.image ||
          (product.images && product.images.length > 0
            ? product.images[0]
            : null),
        // Include all images if available
        category: product.category,
        brand: product.brand,
        description: product.description,
      };
    });

    // 3. Create the order with all product details
    const order = new Order({
      user: checkout.user,
      orderItems: orderItems,
      shippingAddress: checkout.shippingAddress,
      paymentMethod: checkout.paymentMethod,
      totalPrice: checkout.totalPrice,
      isPaid: true,
      paidAt: checkout.paidAt,
      isDelivered: false,
      paymentStatus: "Paid",
      paymentDetails: checkout.paymentDetails,
      checkoutId: checkout._id,
    });

    // 4. Save the order
    const savedOrder = await order.save();

    // 5. Update checkout status
    checkout.isFinalized = true;
    checkout.finalizedAt = Date.now();
    checkout.orderId = savedOrder._id;
    await checkout.save();

    // 6. Clear the user's cart
    await Cart.findOneAndDelete({ user: checkout.user });

    // 7. Return success response with order details
    res.status(201).json({
      success: true,
      order: {
        ...savedOrder.toObject(),
        // Ensure images are included in the response
        orderItems: savedOrder.orderItems.map((item) => ({
          ...item,
          image: item.image || null,
          images: item.images || [],
        })),
      },
      message: "Order created successfully with product images",
    });
  } catch (error) {
    console.error("Finalize checkout error:", error);
    res.status(500).json({
      success: false,
      message: "Error finalizing checkout",
      error: error.message,
    });
  }
});
module.exports = router;
