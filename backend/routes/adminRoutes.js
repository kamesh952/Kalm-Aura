const express = require("express");
const User = require("../models/user");
const { protect, admin } = require("../middleware/authmiddleware");
const router = express.Router();

// @route   GET /api/admin/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get("/", protect, admin, async (req, res) => {
  try {
    // Optionally exclude passwords
    const users = await User.find({}).select("-password"); // Exclude hashed passwords
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
});
// @route   POST /api/admin/users
// @desc    Add a new user (Admin only)
// @access  Private/Admin
router.post("/", protect, admin, async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create the new user
    user = new User({
      name,
      email,
      password, // Assumes hashing is handled in the User model's pre-save middleware
      role: role || "customer",
    });

    await user.save();

    // Remove password from the response
    const { password: pwd, ...userWithoutPassword } = user.toObject();

    res.status(201).json({
      message: "User created successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Admin user creation error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
});
// @route   PUT /api/admin/users/:id
// @desc    Update user info (admin only) - name, email, role
// @access  Private/Admin
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, role } = req.body;

    if (!name && !email && !role) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name ?? user.name;
    user.email = email ?? user.email;
    user.role = role ?? user.role;

    const updatedUser = await user.save();
    const { password, ...userWithoutPassword } = updatedUser.toObject();

    res.status(200).json({
      message: "User updated successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Admin user update error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
}); 

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne(); // Safely deletes the user document
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Admin user delete error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
