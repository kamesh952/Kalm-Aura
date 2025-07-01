import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { 
  CheckCircle, 
  Package, 
  Truck, 
  MapPin, 
  CreditCard, 
  ArrowLeft, 
  Download 
} from 'lucide-react';
import { clearLatestOrder } from "../redux/slices/orderSlice";

const OrderConfirmationPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const latestOrder = useSelector(state => state.orders.latestOrder);
  const loading = useSelector(state => state.orders.loading);

  useEffect(() => {
    // Debug: Log the latest order structure
    console.log('Latest Order:', latestOrder);
    
    // Clear latest order when leaving the page
    return () => {
      dispatch(clearLatestOrder());
    };
  }, [dispatch, latestOrder]);

  const formatDate = (dateString) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getPaymentMethodDisplay = (method) => {
    const methods = {
      upi: 'UPI',
      card: 'Credit/Debit Card',
      netbanking: 'Net Banking',
      wallet: 'Digital Wallet',
      cod: 'Cash on Delivery'
    };
    return methods[method] || method;
  };

  const handleContinueShopping = () => {
    navigate('/');
  };

  const handleViewOrders = () => {
    navigate('/my-orders');
  };

  const handleDownloadReceipt = () => {
    window.print();
  };

  // Helper function to get product data from order item
  const getProductData = (item) => {
    // Check if product is populated (either as object or has required fields)
    if (item.productId && typeof item.productId === 'object' && item.productId.name) {
      return item.productId;
    }
    if (item.product && typeof item.product === 'object' && item.product.name) {
      return item.product;
    }
    
    // Fallback to item properties if product data isn't populated
    return {
      _id: item.productId || item.product,
      name: item.name || 'Product',
      price: item.price || 0,
      image: item.image || '/placeholder-product.png'
    };
  };

  // Get order items array regardless of property name
  const getOrderItems = () => {
    if (!latestOrder) return [];
    return latestOrder.orderItems || latestOrder.OrderItems || latestOrder.items || [];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (!latestOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No recent order found</p>
          <button
            onClick={handleContinueShopping}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">Thank you for your purchase. Your order has been successfully placed.</p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
              <p className="text-sm text-gray-500 mt-1">Order #{latestOrder._id}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Order Date</p>
              <p className="font-medium">{formatDate(latestOrder.createdAt)}</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Items Ordered</h3>
            <div className="space-y-4">
              {getOrderItems().map((item, index) => {
                const product = getProductData(item);
                return (
                  <div key={index} className="flex items-center space-x-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = '/placeholder-product.png';
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {product.name}
                      </h4>
                      {item.size && (
                        <p className="text-sm text-gray-500">Size: {item.size}</p>
                      )}
                      {item.color && (
                        <p className="text-sm text-gray-500">Color: {item.color}</p>
                      )}
                      <p className="text-sm text-gray-500">Quantity: {item.quantity || item.qty || 1}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ₹{(product.price || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Total */}
          <div className="border-t border-gray-200 pt-4 mt-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total Amount</span>
              <span className="text-lg font-bold text-gray-900">
                ₹{(latestOrder.totalPrice || latestOrder.totalAmount || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <CreditCard className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Payment Information</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-medium">
                  {getPaymentMethodDisplay(latestOrder.paymentMethod)}
                </p>
              </div>
              {latestOrder.paymentId && (
                <div>
                  <p className="text-sm text-gray-500">Payment ID</p>
                  <p className="font-medium text-xs">{latestOrder.paymentId}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Payment Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  latestOrder.isPaid 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {latestOrder.isPaid ? 'Paid' : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <MapPin className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Shipping Address</h3>
            </div>
            <div className="text-sm text-gray-600">
              {latestOrder.shippingAddress ? (
                <>
                  <p className="font-medium text-gray-900">
                    {latestOrder.shippingAddress.firstName} {latestOrder.shippingAddress.lastName}
                  </p>
                  <p>{latestOrder.shippingAddress.address}</p>
                  <p>
                    {latestOrder.shippingAddress.city}, {latestOrder.shippingAddress.postalCode}
                  </p>
                  <p>{latestOrder.shippingAddress.country}</p>
                  {latestOrder.shippingAddress.phone && (
                    <p className="mt-2">Phone: {latestOrder.shippingAddress.phone}</p>
                  )}
                </>
              ) : (
                <p>No shipping address provided</p>
              )}
            </div>
          </div>
        </div>

        {/* Delivery Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center mb-4">
            <Truck className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Delivery Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Estimated Delivery</p>
              <p className="font-medium text-lg text-blue-600">
                {latestOrder.estimatedDeliveryDate 
                  ? formatDate(latestOrder.estimatedDeliveryDate)
                  : '3-5 business days'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Shipping Method</p>
              <p className="font-medium">
                {latestOrder.shippingMethod || 'Standard Delivery'}
                {latestOrder.shippingPrice === 0 && ' (Free)'}
              </p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              📦 Your order will be processed within 1-2 business days. 
              {latestOrder.isPaid ? '' : ' Please complete your payment to proceed with shipping.'}
            </p>
          </div>
        </div>

        {/* Order Tracking Steps */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Order Status</h3>
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-2">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs text-center text-green-600 font-medium">Order Confirmed</span>
            </div>
            <div className="flex-1 h-px bg-gray-300 mx-4"></div>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                latestOrder.status === 'processing' ? 'bg-blue-500' : 'bg-gray-300'
              }`}>
                <Package className="w-4 h-4 text-white" />
              </div>
              <span className={`text-xs text-center ${
                latestOrder.status === 'processing' ? 'text-blue-600 font-medium' : 'text-gray-500'
              }`}>
                Processing
              </span>
            </div>
            <div className="flex-1 h-px bg-gray-300 mx-4"></div>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                ['shipped', 'delivered'].includes(latestOrder.status) ? 'bg-blue-500' : 'bg-gray-300'
              }`}>
                <Truck className="w-4 h-4 text-white" />
              </div>
              <span className={`text-xs text-center ${
                ['shipped', 'delivered'].includes(latestOrder.status) ? 'text-blue-600 font-medium' : 'text-gray-500'
              }`}>
                Shipped
              </span>
            </div>
            <div className="flex-1 h-px bg-gray-300 mx-4"></div>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                latestOrder.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'
              }`}>
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <span className={`text-xs text-center ${
                latestOrder.status === 'delivered' ? 'text-green-600 font-medium' : 'text-gray-500'
              }`}>
                Delivered
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleContinueShopping}
            className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </button>
          <button
            onClick={handleViewOrders}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Package className="w-4 h-4 mr-2" />
            View All Orders
          </button>
          <button
            onClick={handleDownloadReceipt}
            className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Receipt
          </button>
        </div>

        {/* Additional Information */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>You will receive an email confirmation shortly with your order details.</p>
          <p className="mt-1">
            Need help? Contact our{' '}
            <a href="/support" className="text-blue-600 hover:text-blue-700">
              customer support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;