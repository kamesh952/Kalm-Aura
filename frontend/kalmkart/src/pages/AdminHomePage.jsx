import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchAllOrders, 
  getOrdersAnalytics,
  clearError 
} from '../redux/slices/adminOrderSlice';
import { Link } from "react-router-dom";
const AdminHomePage = () => {
  const dispatch = useDispatch();

  const { 
    orders, 
    totalOrders, 
    totalSales, 
    loading, 
    error, 
    analytics 
  } = useSelector(state => state.adminOrders);

  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    dispatch(fetchAllOrders());
    dispatch(getOrdersAnalytics());
  }, [dispatch]);

  useEffect(() => {
    // Get last 5 orders for recent orders display
    if (orders.length > 0) {
      const recent = [...orders]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentOrders(recent);
    }
  }, [orders]);

  const handleRowClick = (orderId) => {
    console.log('Navigate to order:', orderId);
    // Replace with your navigation logic: navigate(`/admin/orders/${orderId}`);
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

  const getPaidStatusColor = (isPaid) => {
    return isPaid 
      ? "bg-green-100 text-green-700" 
      : "bg-red-100 text-red-700";
  };

  if (loading && orders.length === 0) {
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
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {/* Revenue Card */}
          <div className="bg-white p-4 sm:p-6 shadow-sm rounded-lg border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-gray-600 mb-1">Total Revenue</h2>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  ${(analytics.totalRevenue || totalSales || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Orders Card */}
          <div className="bg-white p-4 sm:p-6 shadow-sm rounded-lg border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-gray-600 mb-1">Total Orders</h2>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {analytics.totalOrders || totalOrders || 0}
                </p>
                  <Link
                to="/admin/orders"
                  onClick={() => console.log('Navigate to /admin/orders')}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-1 inline-block cursor-pointer"
                >
                  Manage Orders →
                </Link>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Pending Orders Card */}
          <div className="bg-white p-4 sm:p-6 shadow-sm rounded-lg border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-gray-600 mb-1">Pending Orders</h2>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-600">
                  {analytics.pendingOrders || 0}
                </p>
                  <Link
                to="/admin/orders"
                  onClick={() => console.log('Navigate to /admin/orders?status=pending')}
                  className="text-sm text-yellow-600 hover:text-yellow-800 font-medium mt-1 inline-block cursor-pointer"
                >
                  View Pending →
                </Link>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Completed Orders Card */}
          <div className="bg-white p-4 sm:p-6 shadow-sm rounded-lg border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-gray-600 mb-1">Completed Orders</h2>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">
                  {analytics.completedOrders || 0}
                </p>
                 <Link
                to="/admin/products"
                  onClick={() => console.log('Navigate to /admin/products')}
                  className="text-sm text-green-600 hover:text-green-800 font-medium mt-1 inline-block cursor-pointer"
                >
                  Manage Products →
                  </Link>
                
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-0">
                Recent Orders
              </h2>
                <Link
                to="/admin/orders"
                onClick={() => console.log('Navigate to /admin/orders')}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
              >
                View All Orders →
              </Link>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr
                      key={order._id}
                      onClick={() => handleRowClick(order._id)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order._id?.toString().slice(-6) || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.user?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${(order.totalPrice || order.totalAmount || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {order.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaidStatusColor(order.isPaid)}`}>
                          {order.isPaid ? "Paid" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      {loading ? (
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        </div>
                      ) : (
                        "No recent orders found."
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet Cards */}
          <div className="lg:hidden">
            {recentOrders.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <div
                    key={order._id}
                    onClick={() => handleRowClick(order._id)}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Order #{order._id?.toString().slice(-6) || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">{order.user?.name || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          ${(order.totalPrice || order.totalAmount || 0).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status || 'Unknown'}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaidStatusColor(order.isPaid)}`}>
                        {order.isPaid ? "Paid" : "Pending"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                {loading ? (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  "No recent orders found."
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHomePage;