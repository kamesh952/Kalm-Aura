import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchAllOrders, 
  updateOrderStatus, 
  deleteOrder, 
  getOrdersByStatus,
  clearError,
  setFilters 
} from '../../redux/slices/adminOrderSlice';

const OrderManagement = () => {
  const dispatch = useDispatch();
  const { 
    orders, 
    loading, 
    error, 
    totalOrders,
    totalSales,
    filters 
  } = useSelector(state => state.adminOrders);

  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  // Enhanced image parser
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
    // First try parsing the orderItem.image
    const orderImage = parseImageData(orderItem?.image);
    if (orderImage) return orderImage;

    // Fallback to product image if available
    const productImage = parseImageData(orderItem?.productId?.image);
    if (productImage) return productImage;

    // Final fallback to local placeholder
    return "/placeholder-image.jpg";
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await dispatch(updateOrderStatus({ orderId, status: newStatus })).unwrap();
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await dispatch(deleteOrder(orderId)).unwrap();
      } catch (error) {
        console.error('Failed to delete order:', error);
      }
    }
  };

  const handleFilterByStatus = (status) => {
    setSelectedStatus(status);
    dispatch(setFilters({ status }));
    if (status === 'all') {
      dispatch(fetchAllOrders());
    } else {
      dispatch(getOrdersByStatus(status));
    }
    setShowMobileFilters(false);
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Order Management
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
              <span>Total Orders: <span className="font-semibold">{totalOrders}</span></span>
              <span>Total Sales: <span className="font-semibold">${totalSales.toFixed(2)}</span></span>
            </div>
            
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="sm:hidden bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Filters
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{error}</span>
            <button
              onClick={() => dispatch(clearError())}
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
            >
              <span className="sr-only">Dismiss</span>
              ×
            </button>
          </div>
        )}

        {/* Filters */}
        <div className={`mb-6 ${showMobileFilters ? 'block' : 'hidden sm:block'}`}>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Filter by Status</h3>
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'].map(status => (
                <button
                  key={status}
                  onClick={() => handleFilterByStatus(status)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                    selectedStatus === status
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map(order => {
                  const firstItem = order.orderItems?.[0];
                  return (
                    <tr key={order._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order._id.toString().slice(-6)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {firstItem && (
                          <div className="flex items-center">
                            <img
                              src={getProductImage(firstItem)}
                              alt={firstItem.name || 'Product image'}
                              className="h-10 w-10 rounded-md object-cover"
                              onError={(e) => {
                                e.target.src = "/placeholder-image.jpg";
                                e.target.onerror = null;
                              }}
                            />
                            {order.orderItems.length > 1 && (
                              <span className="ml-2 text-xs text-gray-500">
                                +{order.orderItems.length - 1} more
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.user?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${(order.totalPrice || order.totalAmount || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {order.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile/Tablet Cards */}
        <div className="lg:hidden space-y-4">
          {orders.map(order => {
            const firstItem = order.orderItems?.[0];
            return (
              <div key={order._id} className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Order #{order._id.toString().slice(-6)}
                    </h3>
                    <p className="text-sm text-gray-600">{order.user?.name || 'N/A'}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                    {order.status || 'Unknown'}
                  </span>
                </div>
                
                {/* Item Preview */}
                {firstItem && (
                  <div className="flex items-center mb-3">
                    <img
                      src={getProductImage(firstItem)}
                      alt={firstItem.name || 'Product image'}
                      className="h-12 w-12 rounded-md object-cover mr-3"
                      onError={(e) => {
                        e.target.src = "/placeholder-image.jpg";
                        e.target.onerror = null;
                      }}
                    />
                    <div>
                      <p className="text-sm font-medium">{firstItem.name || 'Product'}</p>
                      {order.orderItems.length > 1 && (
                        <p className="text-xs text-gray-500">
                          +{order.orderItems.length - 1} other item{order.orderItems.length > 2 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="mb-4">
                  <p className="text-lg font-semibold text-gray-900">
                    ${(order.totalPrice || order.totalAmount || 0).toFixed(2)}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={order.status || 'pending'}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button
                    onClick={() => handleDeleteOrder(order._id)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {orders.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m0 0V9a2 2 0 012-2h2m0 0V6a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21L13 10M4 13v-2a1 1 0 011-1h1m0 0V9a2 2 0 012-2h2m0 0V6a2 2 0 012-2h.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21L13 10" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-500">
                {selectedStatus === 'all' 
                  ? 'There are no orders to display.' 
                  : `No orders with status "${selectedStatus}" found.`
                }
              </p>
              {selectedStatus !== 'all' && (
                <button
                  onClick={() => handleFilterByStatus('all')}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  Show All Orders
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;