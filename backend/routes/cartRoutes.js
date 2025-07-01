const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Products");
const { protect, admin } = require("../middleware/authmiddleware");




const router = express.Router();

// Normalization helper
const normalize = (str) => str?.trim().toLowerCase().replace(/[^\w\s]/gi, '');

// Helper: Get cart by user or guest
const getCart = async (userId, guestId) => {
  if (userId) return await Cart.findOne({ user: userId });
  if (guestId) return await Cart.findOne({ guestId });
  return null;
};

// @route   POST /api/cart
// @desc    Add a product to the cart
router.post("/", async (req, res) => {
  const { productId, quantity = 1, size, color, guestId, userId } = req.body;

  try {
    if (!productId || !productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    if (!size || !color) {
      return res.status(400).json({ message: "Size and color are required" });
    }

    if (quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await getCart(userId, guestId);

    const normSize = normalize(size);
    const normColor = normalize(color);

    const cartItem = {
      productId,
      name: product.name,
      image: product.images[0].url,
      price: parseFloat(product.price),
      size: normSize,
      color: normColor,
      quantity,
    };

    if (cart) {
      const productIndex = cart.products.findIndex(
        (p) =>
          p.productId.toString() === productId &&
          normalize(p.size) === normSize &&
          normalize(p.color) === normColor
      );

      if (productIndex > -1) {
        cart.products[productIndex].quantity += quantity;
      } else {
        cart.products.push(cartItem);
      }

      cart.totalPrice = cart.products.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      await cart.save();
      return res.status(200).json({ message: "Cart updated", cart });
    } else {
      const newCart = await Cart.create({
        user: userId || undefined,
        guestId: guestId || "guest_" + Date.now(),
        products: [cartItem],
        totalPrice: cartItem.price * quantity,
      });

      return res.status(201).json({ message: "Cart created", cart: newCart });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/cart
// @desc    Update product quantity
router.put("/", async (req, res) => {
  const { productId, quantity, size, color, guestId, userId } = req.body;

  try {
    const cart = await getCart(userId, guestId);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const productIndex = cart.products.findIndex(
      (p) =>
        p.productId.toString() === productId &&
        normalize(p.size) === normalize(size) &&
        normalize(p.color) === normalize(color)
    );

    if (productIndex > -1) {
      if (quantity > 0) {
        cart.products[productIndex].quantity = quantity;
      } else {
        cart.products.splice(productIndex, 1);
      }

      cart.totalPrice = cart.products.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      await cart.save();
      return res.status(200).json({ message: "Cart updated successfully", cart });
    } else {
      return res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   DELETE /api/cart
// @desc    Remove a product from the cart
router.delete("/", async (req, res) => {
  const { productId, size, color, guestId, userId } = req.body;

  try {
    if (!productId || !productId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    if (!size || !color) {
      return res.status(400).json({ message: "Size and color are required" });
    }

    const cart = await getCart(userId, guestId);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const productIndex = cart.products.findIndex(
      (p) =>
        p.productId.toString() === productId &&
        normalize(p.size) === normalize(size) &&
        normalize(p.color) === normalize(color)
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    cart.products.splice(productIndex, 1);

    cart.totalPrice = cart.products.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    if (cart.products.length === 0) {
      await Cart.findByIdAndDelete(cart._id);
      return res.status(200).json({
        message: "Product removed and cart deleted as it's now empty",
        cart: null,
      });
    }

    await cart.save();
    return res.status(200).json({ message: "Product removed from cart", cart });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).json({ message: "Server error" });
  }
});
// @route   GET /api/cart
// @desc    Get logged-in user's or guest user's cart
// @access  Public
router.get("/", async (req, res) => {
  const { userId, guestId } = req.query;

  try {
    if (!userId && !guestId) {
      return res.status(400).json({ message: "userId or guestId is required" });
    }

    const cart = await getCart(userId, guestId);

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    return res.status(200).json({ cart });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Server error" });
  }
});
// @route   POST /api/cart/merge
// @desc    Merge guest cart into user cart on login
// @access  Private
router.post("/merge", protect, async (req, res) => {
  const { guestId } = req.body;

  try {
    const guestCart = await Cart.findOne({ guestId });
    const userCart = await Cart.findOne({ user: req.user._id });

    if (!guestCart || guestCart.products.length === 0) {
      return res.status(200).json({ message: "No guest cart to merge" });
    }

    if (!userCart) {
      // If user doesn't have a cart yet, assign the guest cart to user
      guestCart.user = req.user._id;
      guestCart.guestId = undefined;
      await guestCart.save();
      return res.status(200).json({ message: "Cart merged", cart: guestCart });
    }

    // Merge products from guest cart into user cart
    guestCart.products.forEach((guestItem) => {
      const matchIndex = userCart.products.findIndex(
        (userItem) =>
          userItem.productId.toString() === guestItem.productId.toString() &&
          userItem.size === guestItem.size &&
          userItem.color === guestItem.color
      );

      if (matchIndex > -1) {
        // If same product exists, increase quantity
        userCart.products[matchIndex].quantity += guestItem.quantity;
      } else {
        // Add new item
        userCart.products.push(guestItem);
      }
    });

    // Recalculate total price
    userCart.totalPrice = userCart.products.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    await userCart.save();
    await Cart.deleteOne({ _id: guestCart._id });

    res.status(200).json({ message: "Guest cart merged successfully", cart: userCart });
  } catch (error) {
    console.error("Error merging cart:", error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
