import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchOrderDetails,
  selectOrderDetails,
  selectOrderDetailsLoading,
  selectOrderDetailsError,
  clearOrderDetails,
} from "../redux/slices/orderSlice";

const OrderDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  // Redux state
  const orderDetails = useSelector(selectOrderDetails);
  const loading = useSelector(selectOrderDetailsLoading);
  const error = useSelector(selectOrderDetailsError);

  // Enhanced image parser
  const parseImageData = (image) => {
    if (!image) return null;

    // Case 1: Already a URL string
    if (typeof image === "string" && image.startsWith("http")) {
      return image;
    }

    // Case 2: Stringified object with invalid format
    if (typeof image === "string") {
      try {
        // Direct URL extraction fallback
        const urlMatch = image.match(/https?:\/\/[^\s'"]+/);
        if (urlMatch) return urlMatch[0];

        // Advanced parsing for malformed JSON
        const jsonString = image
          .replace(/\n/g, "") // Remove newlines
          .replace(/'/g, '"') // Replace single quotes
          .replace(/new ObjectId\(([^)]+)\)/g, '"$1"') // Fix ObjectId
          .replace(/([{\s,])(\w+):/g, '$1"$2":') // Quote property names
          .replace(/:\s*"([^"]*)"\s*([,}])/g, (match, p1, p2) => {
            return ': "' + p1.replace(/"/g, '\\"') + '"' + p2; // Escape inner quotes
          });

        const parsed = JSON.parse(jsonString);
        return parsed.url || parsed.imageUrl || parsed;
      } catch (e) {
        console.warn("Image parse failed, attempting direct extraction");
        const urlMatch = image.match(/https?:\/\/[^\s'"]+/);
        return urlMatch ? urlMatch[0] : null;
      }
    }

    // Case 3: Already a proper image object
    return image.url || image;
  };

  const getProductImage = (orderItem) => {
    // First try parsing the orderItem.image
    const orderImage = parseImageData(orderItem?.image);
    if (orderImage) return orderImage;

    // Fallback to product image if available
    const productImage = parseImageData(orderItem?.productId?.image);
    if (productImage) return productImage;

    // Final fallback to local placeholder
    return "/placeholder-image.jpg";
  };

  useEffect(() => {
    let isMounted = true;

    const loadOrderDetails = async () => {
      try {
        if (id) {
          await dispatch(fetchOrderDetails(id)).unwrap();
        }
      } catch (error) {
        console.error("Failed to load order details:", error);
      }
    };

    if (isMounted) {
      loadOrderDetails();
    }

    return () => {
      isMounted = false;
      dispatch(clearOrderDetails());
    };
  }, [dispatch, id]);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Order Details</h2>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading order details...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Order Details</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error Loading Order Details
              </h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
          <div className="mt-4 flex space-x-3">
            <button
              onClick={() => dispatch(fetchOrderDetails(id))}
              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
            <Link
              to="/my-orders"
              className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // No order details found
  if (!orderDetails) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Order Details</h2>
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-500 mb-4">Order not found</p>
          <Link
            to="/my-orders"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  // Calculate total price
  const totalPrice =
    orderDetails.orderItems?.reduce((total, item) => {
      return total + item.quantity * (item.productId?.price || item.price || 0);
    }, 0) ||
    orderDetails.totalPrice ||
    0;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <h2 className="text-2xl md:text-3xl font-bold mb-6">Order Details</h2>

      <div className="p-4 sm:p-6 rounded-lg border">
        {/* Order Info */}
        <div className="flex flex-col sm:flex-row justify-between mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Order ID: {orderDetails._id}
            </h3>
            <p className="text-gray-700">
              {new Date(orderDetails.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end mt-4 sm:mt-0">
            <span
              className={`${
                orderDetails.isPaid
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              } px-3 py-1 rounded-full text-sm font-medium mb-2`}
            >
              {orderDetails.isPaid ? "Approved" : "Pending"}
            </span>
            <span
              className={`${
                orderDetails.isDelivered
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              } px-3 py-1 rounded-full text-sm font-medium`}
            >
              {orderDetails.isDelivered ? "Delivered" : "Pending"}
            </span>
          </div>
        </div>

        {/* Payment and Delivery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Payment Info */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Payment Info</h3>
            <p>Payment Method: {orderDetails.paymentMethod || "N/A"}</p>
            <p>Status: {orderDetails.isPaid ? "Paid ✅" : "Unpaid ❌"}</p>
          </div>

          {/* Shipping Address */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Shipping Address</h3>
            <p>
              {orderDetails.shippingAddress?.address || ""}
              {orderDetails.shippingAddress?.address ? ", " : ""}
              {orderDetails.shippingAddress?.city || "N/A"},{" "}
              {orderDetails.shippingAddress?.country || "N/A"}
            </p>
            {orderDetails.shippingAddress?.postalCode && (
              <p>Postal Code: {orderDetails.shippingAddress.postalCode}</p>
            )}
          </div>

          {/* Delivery */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Delivery</h3>
            <p>Method: {orderDetails.shippingMethod || "Standard"}</p>
            <p>
              Status: {orderDetails.isDelivered ? "Delivered 📦" : "Pending 🚚"}
            </p>
            {orderDetails.deliveredAt && (
              <p className="text-sm text-gray-600">
                Delivered:{" "}
                {new Date(orderDetails.deliveredAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Order Items</h3>

          {/* Order Items Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orderDetails.orderItems?.map((item) => (
                  <tr key={item._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-md object-cover"
                            src={getProductImage(item)}
                            alt={item.name || "Product image"}
                            onError={(e) => {
                              e.target.src = "/placeholder-image.jpg";
                              e.target.onerror = null;
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.name ||
                              item.productId?.name ||
                              "Unknown Product"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{item.price || item.productId?.price || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity || item.qty || 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹
                      {(item.quantity || item.qty || 1) *
                        (item.price || item.productId?.price || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Order Summary */}
          <div className="mt-6 flex justify-end">
            <div className="bg-gray-50 p-4 rounded-lg min-w-64">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Amount:</span>
                <span className="text-xl font-bold text-green-600">
                  ₹{totalPrice}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t">
          <Link
            to="/my-orders"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to My Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
