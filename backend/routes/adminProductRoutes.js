const express = require("express");
const Product = require("../models/Products");
const { protect, admin } = require("../middleware/authmiddleware");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Configure multer for file uploads (adjust storage as needed)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/products/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// @route GET /api/admin/products
// @desc Get all products with pagination (Admin only)
// @access Private/Admin
router.get("/", protect, admin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalProducts = await Product.countDocuments();
    const products = await Product.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalProducts / limit);

    res.json({
      products,
      totalProducts,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route GET /api/admin/products/:id
// @desc Get single product by ID (Admin only)
// @access Private/Admin
router.get("/:id", protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(500).json({ message: "Server Error" });
  }
});

// @route POST /api/admin/products
// @desc Create a new product (Admin only)
// @access Private/Admin
router.post("/", protect, admin, upload.array("images", 5), async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      brand,
      countInStock,
      featured,
    } = req.body;

    // Handle uploaded images
    const images = req.files ? req.files.map(file => file.path) : [];

    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      category,
      brand,
      countInStock: parseInt(countInStock),
      featured: featured === "true",
      images,
      user: req.user._id, // Assuming you want to track who created it
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error(error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(", ") });
    }
    res.status(500).json({ message: "Server Error" });
  }
});

// @route PUT /api/admin/products/:id
// @desc Update a product (Admin only)
// @access Private/Admin
router.put("/:id", protect, admin, upload.array("images", 5), async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      brand,
      countInStock,
      featured,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price ? parseFloat(price) : product.price;
    product.category = category || product.category;
    product.brand = brand || product.brand;
    product.countInStock = countInStock ? parseInt(countInStock) : product.countInStock;
    product.featured = featured !== undefined ? featured === "true" : product.featured;

    // Handle new images if uploaded
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.path);
      product.images = [...product.images, ...newImages];
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Product not found" });
    }
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: errors.join(", ") });
    }
    res.status(500).json({ message: "Server Error" });
  }
});

// @route DELETE /api/admin/products/:id
// @desc Delete a product (Admin only)
// @access Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;