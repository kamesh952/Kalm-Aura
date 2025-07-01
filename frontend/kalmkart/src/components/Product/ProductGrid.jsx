import React from "react";
import { Link } from "react-router-dom";

const ProductGrid = ({ products, loading, error }) => {
  if (loading) {
    return <p>Loading...</p>;
  }
  if (error) {
    return <p>Error: {error}</p>;
  }
  if (!products || products.length === 0) {
    return <p>No products found</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <Link
          key={product._id}
          to={`/product/${product._id}`}
          className="block group"
          state={{ product }} // Pass product data via state
        >
          <div className="bg-white rounded-lg overflow-hidden flex flex-col sm:flex-row lg:flex-col">
            <div className="w-full h-96 overflow-hidden relative">
              <img
                src={product.images[0].url}
                alt={product.images[0].altText || product.name}
                className="w-full h-full object-cover transform transition-transform duration-500 rounded-lg group-hover:brightness-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/30 transition-all duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>

            <div className="p-4 w-full sm:w-1/2 lg:w-full flex flex-col justify-center">
              <h3 className="text-sm font-semibold mb-2 transition-colors duration-300 group-hover:text-gray-500">
                {product.name}
              </h3>
              <p className="text-gray-500 font-medium text-sm tracking-tighter transition-colors duration-300 group-hover:text-gray-700">
                ₹{product.price}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ProductGrid;