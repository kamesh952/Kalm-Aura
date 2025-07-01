import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminProducts, deleteProduct } from "../../redux/slices/adminProductSlice";

const ProductManagement = () => {
  const dispatch = useDispatch();
  const { 
    products, 
    loading, 
    error, 
    totalProducts, 
    currentPage, 
    totalPages 
  } = useSelector((state) => state.adminProducts);

  const [currentPageLocal, setCurrentPageLocal] = useState(1);

  // Enhanced image parser
  const parseImageData = (image) => {
    if (!image) return null;

    // Case 1: Already a URL string
    if (typeof image === 'string' && image.startsWith('http')) {
      return image;
    }

    // Case 2: Stringified object (common in your data)
    if (typeof image === 'string') {
      try {
        // Direct URL extraction fallback
        const urlMatch = image.match(/https?:\/\/[^\s'"]+/);
        if (urlMatch) return urlMatch[0];

        // Advanced parsing for malformed JSON
        const jsonString = image
          .replace(/\n/g, '')         // Remove newlines
          .replace(/'/g, '"')         // Replace single quotes
          .replace(/new ObjectId\(([^)]+)\)/g, '"$1"') // Fix ObjectId
          .replace(/([{\s,])(\w+):/g, '$1"$2":') // Quote property names
          .replace(/:\s*"([^"]*)"\s*([,}])/g, (match, p1, p2) => {
            return ': "' + p1.replace(/"/g, '\\"') + '"' + p2; // Escape inner quotes
          });

        const parsed = JSON.parse(jsonString);
        return parsed.url || parsed.imageUrl || parsed;
      } catch (e) {
        console.warn("Image parse failed, attempting direct extraction");
        // Final fallback - try to extract URL directly
        const urlMatch = image.match(/https?:\/\/[^\s'"]+/);
        return urlMatch ? urlMatch[0] : null;
      }
    }

    // Case 3: Already a proper image object
    return image.url || image;
  };

  const getProductImage = (product) => {
    // First try parsing the first image if it exists
    if (product.images && product.images.length > 0) {
      const firstImage = parseImageData(product.images[0]);
      if (firstImage) return firstImage;
    }

    // Fallback to product.image if available
    const productImage = parseImageData(product.image);
    if (productImage) return productImage;

    // Final fallback to local placeholder
    return "/placeholder-image.jpg";
  };

  // Fetch products on component mount and when page changes
  useEffect(() => {
    dispatch(fetchAdminProducts({ page: currentPageLocal }));
  }, [dispatch, currentPageLocal]);

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await dispatch(deleteProduct(productId)).unwrap();
        // Optionally show success message
        console.log("Product deleted successfully");
      } catch (error) {
        console.error("Failed to delete product:", error);
        alert("Failed to delete product. Please try again.");
      }
    }
  };

  const handlePageChange = (page) => {
    setCurrentPageLocal(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-2 sm:px-3 py-2 mx-0.5 sm:mx-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs sm:text-sm"
        >
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">Prev</span>
        </button>
      );
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-2 sm:px-3 py-2 mx-0.5 sm:mx-1 rounded text-xs sm:text-sm ${
            i === currentPage
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {i}
        </button>
      );
    }

    // Next button
    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-2 sm:px-3 py-2 mx-0.5 sm:mx-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs sm:text-sm"
        >
          <span className="hidden sm:inline">Next</span>
          <span className="sm:hidden">Next</span>
        </button>
      );
    }

    return (
      <div className="flex flex-col sm:flex-row justify-center items-center mt-6 space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-0.5 sm:space-x-1">
          {pages}
        </div>
        <div className="text-xs sm:text-sm text-gray-600 sm:ml-4 text-center">
          Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalProducts)} of {totalProducts} products
        </div>
      </div>
    );
  };

  // Mobile card view for products
  const renderMobileCard = (product) => (
    <div key={product._id} className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
      <div className="flex items-start space-x-3">
        <img
          src={getProductImage(product)}
          alt={product.name}
          className="w-16 h-16 object-cover rounded flex-shrink-0"
          onError={(e) => {
            e.target.src = "/placeholder-image.jpg";
            e.target.onerror = null;
          }}
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Price:</span>
              <span className="font-medium">${product.price?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Category:</span>
              <span className="text-sm">{product.category || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Brand:</span>
              <span className="text-sm">{product.brand || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Stock:</span>
              <span className={`px-2 py-1 rounded text-xs ${
                product.countInStock > 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {product.countInStock || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Status:</span>
              {product.featured ? (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  Featured
                </span>
              ) : (
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                  Regular
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          to={`/product/${product._id}`}
          className="flex-1 min-w-0 px-3 py-2 bg-blue-500 text-white rounded text-xs text-center hover:bg-blue-600 transition"
        >
          View
        </Link>
        <Link
          to={`/admin/products/${product._id}/edit`}
          className="flex-1 min-w-0 px-3 py-2 bg-yellow-500 text-white rounded text-xs text-center hover:bg-yellow-600 transition"
        >
          Edit
        </Link>
        <button
          onClick={() => handleDelete(product._id)}
          disabled={loading}
          className="flex-1 min-w-0 px-3 py-2 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition disabled:opacity-50"
        >
          {loading ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );

  if (loading && products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading products...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold">Product Management</h2>
        <Link
          to="/admin/products/create"
          className="w-full sm:w-auto px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition text-center"
        >
          Add New Product
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto shadow-md sm:rounded-lg">
        <table className="min-w-full text-sm text-left text-gray-500">
          <thead className="bg-gray-200 text-xs uppercase text-gray-700">
            <tr>
              <th className="px-6 py-3">Product Name</th>
              <th className="px-6 py-3">Price ($)</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Brand</th>
              <th className="px-6 py-3">Stock</th>
              <th className="px-6 py-3">Featured</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product._id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="px-6 py-4 font-medium text-gray-900">
                  <div className="flex items-center">
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded mr-3"
                      onError={(e) => {
                        e.target.src = "/placeholder-image.jpg";
                        e.target.onerror = null;
                      }}
                    />
                    {product.name}
                  </div>
                </td>
                <td className="px-6 py-4">${product.price?.toFixed(2)}</td>
                <td className="px-6 py-4">{product.category || 'N/A'}</td>
                <td className="px-6 py-4">{product.brand || 'N/A'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    product.countInStock > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.countInStock || 0}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {product.featured ? (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      Featured
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                      Regular
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 space-x-2">
                  <Link
                    to={`/product/${product._id}`}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition"
                  >
                    View
                  </Link>
                  <Link
                    to={`/admin/products/${product._id}/edit`}
                    className="px-3 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600 transition"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(product._id)}
                    disabled={loading}
                    className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition disabled:opacity-50"
                  >
                    {loading ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}

            {!loading && products.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-8 text-gray-400 italic"
                >
                  No products found. 
                  <Link 
                    to="/admin/products/create"
                    className="text-blue-500 hover:text-blue-700 ml-1"
                  >
                    Create your first product
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Tablet Table View */}
      <div className="hidden md:block lg:hidden overflow-x-auto shadow-md sm:rounded-lg">
        <table className="min-w-full text-sm text-left text-gray-500">
          <thead className="bg-gray-200 text-xs uppercase text-gray-700">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product._id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="px-4 py-4 font-medium text-gray-900">
                  <div className="flex items-center">
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      className="w-8 h-8 object-cover rounded mr-2"
                      onError={(e) => {
                        e.target.src = "/placeholder-image.jpg";
                        e.target.onerror = null;
                      }}
                    />
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-gray-500">{product.category} • {product.brand}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">${product.price?.toFixed(2)}</td>
                <td className="px-4 py-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    product.countInStock > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.countInStock || 0}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col space-y-1">
                    <Link
                      to={`/product/${product._id}`}
                      className="px-2 py-1 bg-blue-500 text-white rounded text-xs text-center hover:bg-blue-600 transition"
                    >
                      View
                    </Link>
                    <Link
                      to={`/admin/products/${product._id}/edit`}
                      className="px-2 py-1 bg-yellow-500 text-white rounded text-xs text-center hover:bg-yellow-600 transition"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(product._id)}
                      disabled={loading}
                      className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!loading && products.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="text-center py-8 text-gray-400 italic"
                >
                  No products found. 
                  <Link 
                    to="/admin/products/create"
                    className="text-blue-500 hover:text-blue-700 ml-1"
                  >
                    Create your first product
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden">
        {products.map(renderMobileCard)}
        
        {!loading && products.length === 0 && (
          <div className="text-center py-8 text-gray-400 italic bg-white border border-gray-200 rounded-lg">
            No products found. 
            <Link 
              to="/admin/products/create"
              className="text-blue-500 hover:text-blue-700 ml-1"
            >
              Create your first product
            </Link>
          </div>
        )}
      </div>

      {renderPagination()}

      {/* Loading overlay for actions */}
      {loading && products.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600 text-center">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;