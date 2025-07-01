import React, { useRef, useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import axios from "axios";

const NewArrivals = () => {
  const scrollContainerRef = useRef(null);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Scroll handlers
  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 300, behavior: "smooth" });
  };

  // Fetch data
  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/products/new-arrivals`
        );
        setNewArrivals(response.data);
      } catch (err) {
        console.error("Failed to fetch new arrivals:", err);
        setError("Failed to load new arrivals. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  // Loading state
  if (loading) {
    return (
      <section className="py-10 px-4">
        <div className="container mx-auto text-center mb-8" style={{ maxWidth: "1370px" }}>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">New Arrivals</h2>
          <p className="text-lg text-gray-600 mb-4">
            Discover the latest styles straight off the runway, freshly added to keep your wardrobe on
            the cutting edge of fashion.
          </p>
          <div className="flex justify-center items-center h-80">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-10 px-4">
        <div className="container mx-auto text-center mb-8" style={{ maxWidth: "1370px" }}>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">New Arrivals</h2>
          <p className="text-lg text-gray-600 mb-4">
            Discover the latest styles straight off the runway, freshly added to keep your wardrobe on
            the cutting edge of fashion.
          </p>
          <div className="flex justify-center items-center h-80">
            <div className="text-red-500 text-lg">{error}</div>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (newArrivals.length === 0) {
    return (
      <section className="py-10 px-4">
        <div className="container mx-auto text-center mb-8" style={{ maxWidth: "1370px" }}>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">New Arrivals</h2>
          <p className="text-lg text-gray-600 mb-4">
            Discover the latest styles straight off the runway, freshly added to keep your wardrobe on
            the cutting edge of fashion.
          </p>
          <div className="flex justify-center items-center h-80">
            <div className="text-gray-500 text-lg">
              No new arrivals available at the moment.
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 px-4">
      <div className="container mx-auto text-center mb-8" style={{ maxWidth: "1370px" }}>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">New Arrivals</h2>
        <p className="text-lg text-gray-600">
          Discover the latest styles straight off the runway, freshly added to keep your wardrobe on
          the cutting edge of fashion.
        </p>
      </div>

      <div className="container mx-auto px-4" style={{ maxWidth: "1370px" }}>
        <div className="relative">
          {/* Navigation arrows */}
          <div className="flex justify-end mb-4 space-x-2">
            <button
              onClick={scrollLeft}
              className="p-2 rounded-xl border-2 bg-white text-black hover:bg-gray-100 transition-colors duration-300"
              aria-label="Scroll left"
            >
              <FiChevronLeft className="text-lg" />
            </button>
            <button
              onClick={scrollRight}
              className="p-2 rounded-xl border-2 bg-white text-black hover:bg-gray-100 transition-colors duration-300"
              aria-label="Scroll right"
            >
              <FiChevronRight className="text-lg" />
            </button>
          </div>
          
          {/* Product grid */}
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto flex space-x-6 scroll-smooth snap-x snap-mandatory pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {newArrivals.map((product) => (
              <Link
                key={product._id}
                to={`/product/${product._id}`}
                state={{ product }}
                className="block flex-shrink-0"
              >
                <div className="w-64 h-80 rounded-lg overflow-hidden shadow-lg relative snap-start group transform hover:scale-105 transition-all duration-300 hover:shadow-2xl cursor-pointer">
                  {/* Product Image */}
                  <img
                    src={product.images?.[0]?.url || "/placeholder.jpg"}
                    alt={product.images?.[0]?.altText || product.name}
                    onError={(e) => {
                      e.target.src = "/placeholder-image.jpg";
                    }}
                    className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110 group-hover:brightness-110"
                  />
                  
                  {/* Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-24 backdrop-blur-sm bg-black/20"></div>
                  
                  {/* Hover Border Effect */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/30 rounded-lg transition-all duration-300"></div>

                  {/* Product Information */}
                  <div className="absolute inset-0 flex items-end">
                    <div className="text-white p-4 w-full transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="font-medium text-lg group-hover:text-yellow-300 transition-colors duration-300 line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-gray-200 mb-2 group-hover:text-blue-200 transition-colors duration-300 line-clamp-1">
                        {product.brand}
                      </p>
                      <p className="mt-1 text-xl font-bold group-hover:text-green-300 transition-colors duration-300">
                        ₹{product.discountPrice || product.price}
                        {product.discountPrice && (
                          <span className="ml-2 text-sm text-gray-300 line-through">
                            ₹{product.price}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;