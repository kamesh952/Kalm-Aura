import React from "react";
import { Link } from "react-router-dom";

const ProductPreview = ({ product }) => {
  // Calculate discount percentage (if applicable)
  const discountPercentage = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/products/${product._id}`}>
        <div className="aspect-square bg-gray-100 relative transition-transform hover:scale-[1.02]">
          <img
            src={product.images?.[0]?.url || "/placeholder-product.jpg"}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
          {discountPercentage && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              {`${discountPercentage}% OFF`}
            </div>
          )}

          {!product.inStock && (
            <div className="absolute bottom-2 left-2 bg-gray-700 text-white text-xs font-medium px-2 py-1 rounded">
              Out of Stock
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/products/${product._id}`}>
          <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
        </Link>

        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">
            ₹{product.discountPrice || product.price}
          </span>
          {product.discountPrice && (
            <span className="text-gray-500 text-sm line-through">
              ₹{product.price}
            </span>
          )}
        </div>

        <div className="mt-2">
          <Link
            to={`/products/${product._id}`}
            className="inline-block w-full text-center bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductPreview;
