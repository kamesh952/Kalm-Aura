import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCart } from "../../redux/slices/cartSlice";
import { fetchSimilarProducts } from "../../redux/slices/ProductSlice";
import ProductGrid from "./ProductGrid";
import { Loader2, Check, ChevronLeft } from "lucide-react";

const CustomPopup = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm w-full border border-gray-200">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 text-green-600" />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-700">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get user data and similar products from Redux
  const { user } = useSelector((state) => state.auth);
  const { similarProducts, loading: productsLoading } = useSelector((state) => state.products);
  const userId = user?._id || null;
  const { loading: cartLoading, error: cartError } = useSelector(
    (state) => state.cart
  );

  const [product, setProduct] = useState(location.state?.product || null);
  const [loading, setLoading] = useState(!location.state?.product);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [hasAddedToCart, setHasAddedToCart] = useState(false);

  // Fetch product details
  useEffect(() => {
    if (!product) {
      const fetchProduct = async () => {
        try {
          setLoading(true);
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`
          );
          if (!response.ok) throw new Error("Product not found");
          const data = await response.json();
          setProduct(data);
          setSelectedImage(data.images?.[0] || null);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    } else {
      setSelectedImage(product.images?.[0] || null);
    }
  }, [id, product]);

  // Fetch similar products using Redux
  useEffect(() => {
    if (product?._id) {
      dispatch(fetchSimilarProducts({ id: product._id }));
    }
  }, [dispatch, product?._id]);

  useEffect(() => {
    if (hasAddedToCart) {
      const timer = setTimeout(() => {
        setHasAddedToCart(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hasAddedToCart]);

  const increment = () => setQuantity((q) => q + 1);
  const decrement = () => setQuantity((q) => (q > 1 ? q - 1 : 1));
  const closePopup = () => setShowPopup(false);

  const handleAddToCart = async () => {
    if (!selectedSize || !selectedColor) {
      setPopupMessage("Please select a size and color before adding to cart.");
      setShowPopup(true);
      return;
    }

    setIsAdding(true);
    setHasAddedToCart(false);

    try {
      let guestId = null;
      if (!userId) {
        guestId = localStorage.getItem("guestId") || `guest_${Date.now()}`;
        if (!localStorage.getItem("guestId")) {
          localStorage.setItem("guestId", guestId);
        }
      }

      const cartItemData = {
        productId: product._id,
        quantity,
        size: selectedSize,
        color: selectedColor,
        userId: userId || null,
        guestId: userId ? null : guestId,
      };

      // First add the item to cart
      const addResult = await dispatch(addToCart(cartItemData));

      if (addToCart.fulfilled.match(addResult)) {
        // Then fetch the updated cart
        const fetchResult = await dispatch(
          fetchCart({
            userId: userId || null,
            guestId: userId ? null : guestId,
          })
        );

        if (fetchCart.fulfilled.match(fetchResult)) {
          setPopupMessage(`${product.name} was added to your cart!`);
          setShowPopup(true);
          setHasAddedToCart(true);
          setQuantity(1);
          setSelectedSize("");
          setSelectedColor("");
        } else {
          throw new Error("Failed to refresh cart");
        }
      } else {
        throw new Error(addResult.payload || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      setPopupMessage(
        error.message || "Failed to add product to cart. Please try again."
      );
      setShowPopup(true);
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        Error: {error}
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-blue-600 hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6 text-center">
        Product not found
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-blue-600 hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to products
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Image Gallery */}
          <div className="flex-1 max-w-lg mx-auto lg:mx-0">
            <div className="sticky top-4">
              {/* Main Image */}
              <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-4">
                {selectedImage ? (
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.altText || product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-500">No image available</span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images?.length > 1 && (
                <div className="flex gap-3 overflow-x-auto py-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(image)}
                      className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                        selectedImage?.url === image.url
                          ? "border-blue-500"
                          : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex-1 lg:max-w-md">
            <div className="sticky top-4 space-y-6">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  {product.name}
                </h1>
                {product.brand && (
                  <p className="text-gray-600 mt-1">Brand: {product.brand}</p>
                )}
              </div>

              {/* Price */}
              <div className="flex items-center gap-3">
                {product.originalPrice && (
                  <span className="text-lg text-gray-500 line-through">
                    ₹{product.originalPrice}
                  </span>
                )}
                <span className="text-2xl font-bold text-gray-900">
                  ₹{product.price}
                </span>
                {product.originalPrice && (
                  <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded">
                    {Math.round(
                      ((product.originalPrice - product.price) /
                        product.originalPrice) *
                        100
                    )}
                    % OFF
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>

              {/* Color Selection */}
              {product.colors?.length > 0 && (
                <div>
                  <p className="text-gray-800 font-medium mb-2">
                    Color:{" "}
                    {selectedColor && (
                      <span className="text-blue-600 capitalize ml-1">
                        {selectedColor}
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          selectedColor === color
                            ? "border-blue-500 ring-2 ring-blue-200"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        style={{ backgroundColor: color.toLowerCase() }}
                        title={color}
                        aria-label={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes?.length > 0 && (
                <div>
                  <p className="text-gray-800 font-medium mb-2">
                    Size:{" "}
                    {selectedSize && (
                      <span className="text-blue-600 ml-1">{selectedSize}</span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 text-sm rounded-md border transition-all ${
                          selectedSize === size
                            ? "bg-blue-50 border-blue-500 text-blue-700"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div>
                <p className="text-gray-800 font-medium mb-2">Quantity</p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={decrement}
                    disabled={quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center rounded border border-gray-300 disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={increment}
                    className="w-10 h-10 flex items-center justify-center rounded border border-gray-300"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={
                  isAdding || hasAddedToCart || !selectedSize || !selectedColor
                }
                className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
                  isAdding || hasAddedToCart
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                {isAdding ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </span>
                ) : hasAddedToCart ? (
                  <span className="flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" />
                    Added to Cart
                  </span>
                ) : (
                  "ADD TO CART"
                )}
              </button>

              {/* Product Details */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-lg font-semibold mb-3">Product Details</h3>
                <div className="space-y-3 text-sm">
                  {product.material && (
                    <div className="flex">
                      <span className="text-gray-600 w-24">Material</span>
                      <span className="text-gray-800">{product.material}</span>
                    </div>
                  )}
                  {product.category && (
                    <div className="flex">
                      <span className="text-gray-600 w-24">Category</span>
                      <span className="text-gray-800 capitalize">
                        {product.category}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Products Section */}
        {similarProducts && similarProducts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Similar Products
            </h2>
            {productsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
              </div>
            ) : (
              <ProductGrid products={similarProducts} />
            )}
          </div>
        )}
      </div>

      {/* Success Popup */}
      <CustomPopup
        isOpen={showPopup}
        onClose={closePopup}
        message={popupMessage}
      />
    </div>
  );
};

export default ProductDetails;