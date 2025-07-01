const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: String,
    image: String,
    price: {
      type: Number,
      required: true,
    },
    size: String,
    color: String,
    quantity: {
      type: Number,
      default: 1,
    },
  },
  { _id: false }
);

// Normalize color & size before saving
cartItemSchema.pre("save", function (next) {
  if (this.color) {
    this.color = this.color.trim().toLowerCase().replace(/[^\w\s]/gi, '');
  }
  if (this.size) {
    this.size = this.size.trim().toLowerCase().replace(/[^\w\s]/gi, '');
  }
  next();
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    guestId: {
      type: String,
    },
    products: [cartItemSchema],
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
