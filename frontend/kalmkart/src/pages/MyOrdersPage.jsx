import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchUserOrders,
  fetchMissingProductDetails,
  selectOrdersWithProductData,
  selectOrdersLoading,
  selectOrdersError,
  selectHasMissingProductData,
  selectPendingProductFetches,
  selectProductsLoading
} from "../redux/slices/orderSlice";

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const orders = useSelector(selectOrdersWithProductData);
  const loading = useSelector(selectOrdersLoading);
  const error = useSelector(selectOrdersError);
  const hasMissingProductData = useSelector(selectHasMissingProductData);
  const pendingProductFetches = useSelector(selectPendingProductFetches);
  const productsLoading = useSelector(selectProductsLoading);

  useEffect(() => {
    dispatch(fetchUserOrders());
  }, [dispatch]);

  useEffect(() => {
    if (hasMissingProductData && pendingProductFetches.length > 0) {
      dispatch(fetchMissingProductDetails(pendingProductFetches));
    }
  }, [hasMissingProductData, pendingProductFetches, dispatch]);

  // Robust image parser that handles stringified objects
 const parseImageData = (image) => {
  if (!image) return null;

  // Case 1: Already a URL string
  if (typeof image === 'string' && image.startsWith('http')) {
    return image;
  }

  // Case 2: Stringified object with invalid format
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

  const getProductImage = (orderItem) => {
    // Try to parse the orderItem.image first
    const orderImage = parseImageData(orderItem.image);
    if (orderImage) return orderImage;

    // Fallback to product image if available
    const productImage = parseImageData(orderItem.productId?.image);
    if (productImage) return productImage;

    // Final fallback to placeholder
    return "https://via.placeholder.com/48?text=No+Image";
  };

  const getProductName = (orderItem) => {
    return orderItem.productId?.name || orderItem.name || 'Unknown Product';
  };

  const handleRowClick = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  // Debug: Log image parsing results
  useEffect(() => {
    if (orders.length > 0 && orders[0].orderItems) {
      const testItem = orders[0].orderItems[0];
      console.log("Image parsing debug:", {
        rawImage: testItem.image,
        parsed: parseImageData(testItem.image),
        finalURL: getProductImage(testItem)
      });
    }
  }, [orders]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center text-red-800">
          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Error loading orders: {error}</span>
        </div>
        <button
          onClick={() => dispatch(fetchUserOrders())}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded-md text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        {productsLoading && (
          <span className="text-sm text-gray-500 flex items-center">
            <span className="animate-spin mr-2">↻</span>
            Loading product details...
          </span>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No orders</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by placing your first order.</p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/collection/:collection')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Browse Products
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => {
                const firstItem = order.orderItems?.[0];
                return (
                  <tr 
                    key={order._id} 
                    onClick={() => handleRowClick(order._id)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-md object-cover"
                            src={getProductImage(firstItem)}
                            alt={getProductName(firstItem)}
                            onError={(e) => {
                              console.error("Image load failed for item:", {
                                rawImage: firstItem?.image,
                                productImage: firstItem?.productId?.image,
                                parsed: parseImageData(firstItem?.image)
                              });
                              e.target.src = "https://via.placeholder.com/48?text=No+Image";
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {getProductName(firstItem)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.orderItems.length} {order.orderItems.length === 1 ? 'item' : 'items'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      #{order._id.slice(-8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${order.totalPrice?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;