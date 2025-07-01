const express = require("express");
const router = express.Router();
const Subscriber = require("../models/Subscriber");

// @route   POST /api/subscribe
// @desc    Handle newsletter subscription
// @access  Public
router.post("/subscribe", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Check if the email is already subscribed
    let subscriber = await Subscriber.findOne({ email });

    if (subscriber) {
      return res.status(400).json({ message: "Email is already subscribed" });
    }

    // Create and save new subscriber
    const newSubscriber = new Subscriber({ email });
    await newSubscriber.save();

    res.status(201).json({ message: "Subscription successful" });
  } catch (error) {
    console.error("Subscription error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

module.exports = router;
