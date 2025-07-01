import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Hero from "../components/Layout/Hero";
import GenderCollectionSection from "../components/Product/GenderCollectionSection";
import NewArrivals from "../components/Product/NewArrivals";
import FeaturedCollection from "../components/Product/FeaturedCollection";
import { motion } from "framer-motion";
import { fetchProductsByFilters } from "../redux/slices/ProductSlice";
import ProductGrid from "../components/Product/ProductGrid";

const zoomIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const BestSellerCard = ({ product }) => {
  const [selectedImage, setSelectedImage] = useState(
    product?.images?.[0] || null
  );
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  if (!product) return null;

  const handleViewDetails = () => {
    navigate(`/product/${product._id}`, {
      state: { product },
    });
  };

  const discountPercentage = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  return (
    <motion.div
      className="relative max-w-6xl mx-auto overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-br from-white via-gray-50 to-gray-100"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-400/5 via-pink-400/5 to-yellow-400/5"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-300/20 to-orange-300/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-300/20 to-pink-300/20 rounded-full blur-2xl"></div>

      {/* Best Seller Badge */}
      <motion.div
        className="absolute top-6 left-6 z-10"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.5, duration: 0.6, type: "spring" }}
      >
        <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
          <motion.span
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-lg"
          >
            🏆
          </motion.span>
          <span className="tracking-wide">BEST SELLER</span>
        </div>
      </motion.div>

      {/* Discount Badge */}
      {discountPercentage > 0 && (
        <motion.div
          className="absolute top-6 right-6 z-10"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.7, duration: 0.5, type: "spring" }}
        >
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 rounded-2xl text-sm font-bold shadow-xl">
            <div className="text-xs opacity-90">SAVE</div>
            <div className="text-lg font-black leading-none">
              {discountPercentage}%
            </div>
          </div>
        </motion.div>
      )}

      <div className="relative p-8 lg:p-12">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Product Images */}
          <motion.div
            className="lg:w-1/2"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="relative mb-6"
              variants={slideUp}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                {selectedImage ? (
                  <motion.img
                    src={selectedImage.url || selectedImage}
                    alt={selectedImage.altText || product.name}
                    className="w-full h-[500px] object-cover"
                    animate={{ scale: isHovered ? 1.05 : 1 }}
                    transition={{ duration: 0.6 }}
                  />
                ) : (
                  <div className="w-full h-[500px] bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center rounded-2xl">
                    <div className="text-center text-gray-500">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-400/20 flex items-center justify-center"
                      >
                        <svg
                          className="w-8 h-8"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </motion.div>
                      <span className="text-lg font-medium">
                        No image available
                      </span>
                    </div>
                  </div>
                )}

                {/* Image Overlay Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </motion.div>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <motion.div
                className="flex gap-3 overflow-x-auto pb-2"
                variants={slideUp}
              >
                {product.images.map((image, index) => (
                  <motion.div
                    key={index}
                    className="flex-shrink-0"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <img
                      src={typeof image === "string" ? image : image.url}
                      alt={
                        typeof image === "object"
                          ? image.altText
                          : `Thumbnail ${index}`
                      }
                      className={`w-16 h-16 object-cover rounded-xl cursor-pointer border-3 transition-all duration-300 shadow-lg ${
                        selectedImage === image ||
                        selectedImage?.url ===
                          (typeof image === "string" ? image : image.url)
                          ? "border-blue-500 shadow-blue-500/50"
                          : "border-white/50 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedImage(image)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            className="lg:w-1/2 space-y-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={slideUp}>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent leading-tight">
                {product.name}
              </h2>
            </motion.div>

            <motion.div
              className="flex items-center gap-4 mb-6"
              variants={slideUp}
            >
              {product.originalPrice && (
                <span className="text-xl text-gray-400 line-through font-medium">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
              )}
              <span className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                ₹{product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <motion.span
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg"
                  whileHover={{ scale: 1.05 }}
                >
                  Save ₹
                  {(product.originalPrice - product.price).toLocaleString()}
                </motion.span>
              )}
            </motion.div>

            <motion.p
              className="text-gray-600 text-lg leading-relaxed"
              variants={slideUp}
            >
              {product.description}
            </motion.p>

            {/* Colors */}
            {product.colors?.length > 0 && (
              <motion.div variants={slideUp}>
                <p className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wider">
                  Available Colors:
                </p>
                <div className="flex gap-3">
                  {product.colors.slice(0, 5).map((color, index) => (
                    <motion.div
                      key={index}
                      className="relative group"
                      whileHover={{ scale: 1.2, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <div
                        className="w-10 h-10 rounded-full border-3 border-white shadow-lg cursor-pointer transition-all duration-300 group-hover:shadow-xl"
                        style={{ backgroundColor: color.toLowerCase() }}
                        title={color}
                      />
                      <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-gray-400 transition-all duration-300"></div>
                    </motion.div>
                  ))}
                  {product.colors.length > 5 && (
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full border-3 border-white shadow-lg">
                      <span className="text-xs font-bold text-gray-600">
                        +{product.colors.length - 5}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <motion.div variants={slideUp}>
                <p className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wider">
                  Available Sizes:
                </p>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((size, index) => (
                    <motion.span
                      key={index}
                      className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 shadow-sm hover:shadow-md transition-all duration-300"
                      whileHover={{
                        scale: 1.05,
                        y: -1,
                        backgroundColor: "#f8fafc",
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {size}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Product Details */}
            <motion.div
              className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 shadow-lg"
              variants={slideUp}
              whileHover={{
                y: -2,
                shadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              }}
            >
              <h4 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Product Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {product.brand && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">Brand:</span>
                    <span className="text-gray-600 font-medium">
                      {product.brand}
                    </span>
                  </div>
                )}
                {product.category && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">
                      Category:
                    </span>
                    <span className="text-gray-600 font-medium">
                      {product.category}
                    </span>
                  </div>
                )}
                {product.material && (
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <span className="font-semibold text-gray-700">
                      Material:
                    </span>
                    <span className="text-gray-600 font-medium">
                      {product.material}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div variants={slideUp}>
              <motion.button
                onClick={handleViewDetails}
                className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-2xl relative overflow-hidden group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative z-10 flex items-center justify-center gap-3">
                  View Product Details
                  <motion.svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={{ x: isHovered ? 5 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </motion.svg>
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const Home = () => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.products);
  const [bestSellerProduct, setBestSellerProduct] = useState(null);
  const [bestSellerLoading, setBestSellerLoading] = useState(true);
  const [bestSellerError, setBestSellerError] = useState(null);

  useEffect(() => {
    dispatch(
      fetchProductsByFilters({
        gender: "Women",
        limit: 8,
      })
    );

    fetchBestSeller();
  }, [dispatch]);

  const fetchBestSeller = async () => {
    try {
      setBestSellerLoading(true);
      setBestSellerError(null);

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/best-seller`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (response.headers["content-type"]?.includes("application/json")) {
        setBestSellerProduct(response.data?.product || response.data);
      } else {
        throw new Error("API returned HTML instead of JSON");
      }
    } catch (error) {
      console.error("Failed to fetch best seller:", error);

      if (error.message.includes("HTML")) {
        setBestSellerError(
          "Best seller endpoint not found. Please check your API configuration."
        );
      } else if (error.response?.status === 404) {
        setBestSellerError("No best seller product found.");
      } else if (error.response?.status >= 500) {
        setBestSellerError("Server error. Please try again later.");
      } else {
        setBestSellerError("Failed to load best seller product.");
      }

      if (import.meta.env.DEV) {
        setBestSellerProduct({
          _id: "mock-best-seller",
          name: "Premium Cotton T-Shirt",
          price: 999,
          originalPrice: 1499,
          description:
            "Experience unmatched comfort and style with our premium cotton t-shirt. Crafted from the finest materials for everyday luxury.",
          images: ["/placeholder-product.jpg"],
          colors: ["Black", "White", "Gray", "Navy", "Burgundy"],
          sizes: ["S", "M", "L", "XL", "XXL"],
          brand: "Fashion Brand",
          category: "T-Shirts",
          material: "100% Premium Cotton",
        });
      }
    } finally {
      setBestSellerLoading(false);
    }
  };

  const renderBestSellerSection = () => {
    if (bestSellerLoading) {
      return (
        <motion.div
          className="text-center py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="inline-block w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-600 text-lg">Loading our best seller...</p>
        </motion.div>
      );
    }

    if (bestSellerError) {
      return (
        <motion.div
          className="text-center py-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-2xl p-8 max-w-md mx-auto shadow-lg">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-red-700 mb-6 font-medium">{bestSellerError}</p>
            <motion.button
              onClick={fetchBestSeller}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Try Again
            </motion.button>
          </div>
        </motion.div>
      );
    }

    if (!bestSellerProduct) {
      return (
        <motion.div
          className="text-center py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-gray-500 text-lg">
            No best seller product available
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={zoomIn}
      >
        <BestSellerCard product={bestSellerProduct} />
      </motion.div>
    );
  };

  return (
    <div className="pb-16">
      {/* Hero Section */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={zoomIn}
      >
        <Hero />
      </motion.div>

      {/* Gender Collections */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={zoomIn}
      >
        <h2 className="text-4xl text-center mt-9 lg:text-5xl font-bold bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-500
 bg-clip-text text-transparent mb-4">
          🔥 Men and Women Collections 🔥
        </h2>
        <GenderCollectionSection />
      </motion.div>

      {/* New Arrivals */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={zoomIn}
      >
        <h2
          className="text-4xl text-center mt-9 lg:text-5xl font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-red-500
 bg-clip-text text-transparent mb-4"
        >
          🔥 Explore New Arrivals 🔥
        </h2>
        <NewArrivals />
      </motion.div>

      {/* Best Seller */}
      <div
        className="container mx-auto mt-20 mb-20 px-4"
        style={{ maxWidth: "1370px" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent mb-4">
            ✨ Best Seller ✨
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover our most loved product, chosen by thousands of satisfied
            customers
          </p>
        </motion.div>
        {renderBestSellerSection()}
      </div>

      {/* Top Wears for Women */}
      <div
        className="container mx-auto mt-20 mb-8 px-4"
        style={{ maxWidth: "1360px" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
           ✨ Top Wears for Women ✨
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Explore our curated collection of trending fashion for the modern
            woman
          </p>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={zoomIn}
        >
          {loading ? (
            <div className="text-center py-20">
              <motion.div
                className="inline-block w-12 h-12 border-4 border-purple-300 border-t-purple-600 rounded-full mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p className="text-gray-600 text-lg">Loading products...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-red-600">Error loading products: {error}</p>
              </div>
            </div>
          ) : (
            <ProductGrid products={products} />
          )}
        </motion.div>
      </div>

      {/* Featured Collection */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={zoomIn}
      >
        <FeaturedCollection />
      </motion.div>
    </div>
  );
};

export default Home;