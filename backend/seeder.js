const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Products");
const User = require("./models/user");
const Cart = require("./models/Cart");
const products = require("./data/products");

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    // Clear existing data
    await Product.deleteMany();
    await User.deleteMany();
    await Cart.deleteMany();

    // Create a default admin user
    const createdUser = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: "123456",
      role: "admin",
    });

    // Add the admin's _id to each product as a createdBy or user field if needed
    const sampleProducts = products.map((product) => {
      return { ...product, user: createdUser._id };
    });

    // Insert products
    await Product.insertMany(sampleProducts);

    console.log("Data seeded successfully");
    process.exit(); // Exit process after seeding
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1); // Exit with failure
  }
};

seedData();
