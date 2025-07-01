const express = require("express");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { protect } = require("../middleware/authmiddleware");
const router = express.Router();

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post("/register", async (req, res) => {
  let { name, email, password } = req.body;

  console.log("📨 Register request body:", req.body);

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please fill in all fields" });
  }

  try {
    email = email.toLowerCase().trim();

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    user = new User({ name, email, password });
    await user.save();

    const payload = {
      user: {
        id: user._id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          token,
        });
      }
    );
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST /api/users/login
// @desc    Authenticate user & get token
// @access  Public
// @route   POST /api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Please provide both email and password" 
      });
    }

    // Find user with email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    // Debug: Check if user password exists
    if (!user.password) {
      console.error('User password is missing in database:', user.email);
      return res.status(500).json({
        success: false,
        message: "Server configuration error"
      });
    }

    // Compare passwords
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    // Create JWT token
    const payload = {
      user: {
        id: user._id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) {
          console.error("JWT signing error:", err);
          return res.status(500).json({
            success: false,
            message: "Error generating token"
          });
        }
        
        res.json({
          success: true,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
          token,
        });
      }
    );
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
});

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get("/profile", protect, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error("Profile error:", error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;