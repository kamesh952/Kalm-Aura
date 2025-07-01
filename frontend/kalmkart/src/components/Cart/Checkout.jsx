import React, { useState, useEffect } from "react";
import { X, MoreHorizontal, Clock, ChevronRight, CheckCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  createCheckoutSession, 
  updatePaymentStatus, 
  finalizeCheckout,
  clearCheckout,
  clearError
} from '../../redux/slices/checkoutSlice';

// Toast Component
const Toast = ({ message, isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-[60] animate-in slide-in-from-top-2 duration-300">
      <div className="bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 min-w-[300px]">
        <CheckCircle className="w-6 h-6 flex-shrink-0" />
        <div>
          <p className="font-semibold">Payment Successful!</p>
          <p className="text-sm opacity-90">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-auto text-white hover:text-gray-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// Payment Options Component
const PaymentOptionsModal = ({ 
  shippingAddress, 
  cartData, 
  onClose, 
  onPaymentSuccess,
  checkoutId,
  updatePaymentStatus,
  finalizeCheckout,
  paymentLoading,
  finalizeLoading,
  error
}) => {
  const [selectedPayment, setSelectedPayment] = useState('upi');
  const [showToast, setShowToast] = useState(false);

  const handlePayNow = async () => {
    try {
      // Update payment status - use 'Paid' as per backend validation
      const paymentResult = await updatePaymentStatus({
        checkoutId,
        paymentStatus: 'Paid', // Changed from 'completed' to 'Paid'
        paymentDetails: {
          method: selectedPayment,
          amount: cartData.totalPrice,
          transactionId: 'pay_' + Date.now(),
          paidAt: new Date().toISOString()
        }
      }).unwrap();

      // Finalize checkout
      const order = await finalizeCheckout(checkoutId).unwrap();
      
      setShowToast(true);
      
      // Close modal after toast appears
      setTimeout(() => {
        onPaymentSuccess(order);
      }, 2000);
    } catch (error) {
      console.error("Payment processing failed:", error);
    }
  };

  const handleToastClose = () => {
    setShowToast(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-96 max-h-[600px] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="font-semibold text-lg">My Store</span>
            </div>
            <div className="flex items-center space-x-2">
              <MoreHorizontal className="w-5 h-5 text-gray-400" />
              <X className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" onClick={onClose} />
            </div>
          </div>

          {/* Price Summary */}
          <div className="p-4 bg-gray-50">
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-2">Price Summary</h3>
              <div className="text-2xl font-bold">₹{cartData.totalPrice}</div>
            </div>
            
            <div className="mt-3 bg-white rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-xs">👤</span>
                </div>
                <span className="text-sm">Using as {shippingAddress.phone || '+91 86808 92898'}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Payment Options */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Payment Options</h3>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-500">UPI QR</span>
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {/* Recommended */}
              <div className="text-sm font-medium text-gray-600 mb-2">Recommended</div>
              
              {/* UPI */}
              <div 
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedPayment === 'upi' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPayment('upi')}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">UPI</span>
                  <div className="flex space-x-1">
                    <div className="w-6 h-4 bg-orange-500 rounded-sm"></div>
                    <div className="w-6 h-4 bg-purple-600 rounded-sm"></div>
                    <div className="w-6 h-4 bg-blue-600 rounded-sm"></div>
                    <div className="w-6 h-4 bg-orange-400 rounded-sm"></div>
                  </div>
                </div>
              </div>

              {/* Cards */}
              <div 
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedPayment === 'cards' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPayment('cards')}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">Cards</span>
                  <div className="flex space-x-1">
                    <div className="w-6 h-4 bg-blue-600 rounded-sm"></div>
                    <div className="w-6 h-4 bg-red-500 rounded-sm"></div>
                    <div className="w-6 h-4 bg-gray-400 rounded-sm"></div>
                    <div className="w-6 h-4 bg-blue-800 rounded-sm"></div>
                  </div>
                </div>
              </div>

              {/* Netbanking */}
              <div 
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedPayment === 'netbanking' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPayment('netbanking')}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">Netbanking</span>
                  <div className="flex space-x-1">
                    <div className="w-6 h-4 bg-orange-500 rounded-sm"></div>
                    <div className="w-6 h-4 bg-yellow-500 rounded-sm"></div>
                    <div className="w-6 h-4 bg-yellow-400 rounded-sm"></div>
                    <div className="w-6 h-4 bg-green-500 rounded-sm"></div>
                  </div>
                </div>
              </div>

              {/* Wallet */}
              <div 
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedPayment === 'wallet' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPayment('wallet')}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">Wallet</span>
                  <div className="flex space-x-1">
                    <div className="w-6 h-4 bg-blue-600 rounded-sm"></div>
                    <div className="w-6 h-4 bg-red-500 rounded-sm"></div>
                    <div className="w-6 h-4 bg-green-500 rounded-sm"></div>
                    <div className="w-6 h-4 bg-blue-800 rounded-sm"></div>
                  </div>
                </div>
              </div>

              {/* Pay Later */}
              <div 
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedPayment === 'paylater' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPayment('paylater')}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">Pay Later</span>
                  <div className="flex space-x-1">
                    <div className="w-6 h-4 bg-red-600 rounded-sm"></div>
                    <div className="w-6 h-4 bg-red-500 rounded-sm"></div>
                    <div className="w-6 h-4 bg-blue-500 rounded-sm"></div>
                    <div className="w-6 h-4 bg-blue-800 rounded-sm"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* UPI QR Section */}
            {selectedPayment === 'upi' && (
              <div className="mt-6 text-center">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="w-32 h-32 bg-black mx-auto mb-3 rounded-lg flex items-center justify-center">
                    <div className="w-28 h-28 bg-white rounded grid grid-cols-8 gap-px p-1">
                      {[...Array(64)].map((_, i) => (
                        <div key={i} className={`${Math.random() > 0.5 ? 'bg-black' : 'bg-white'} rounded-sm`}></div>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Scan the QR using any UPI App</p>
                  <div className="flex justify-center space-x-2 mt-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-full"></div>
                    <div className="w-8 h-8 bg-purple-600 rounded-full"></div>
                    <div className="w-8 h-8 bg-gray-800 rounded-full"></div>
                    <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
                    <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Pay Now Button */}
            <button
              onClick={handlePayNow}
              disabled={paymentLoading || finalizeLoading}
              className={`w-full mt-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                paymentLoading || finalizeLoading
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
              }`}
            >
              {paymentLoading || finalizeLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>
                    {paymentLoading ? 'Processing Payment...' : 'Finalizing Order...'}
                  </span>
                </div>
              ) : (
                `Pay Now ₹${cartData.totalPrice}`
              )}
            </button>

            {error && (
              <div className="mt-3 text-red-500 text-sm text-center">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t text-center">
            <p className="text-xs text-gray-500">
              By proceeding, I agree to Razorpay's Privacy Notice
            </p>
            <div className="flex items-center justify-center mt-2 text-xs text-gray-400">
              <span>Secured by</span>
              <span className="ml-1 font-semibold">Razorpay</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        message={`Amount ₹${cartData.totalPrice} has been paid successfully!`}
        isVisible={showToast}
        onClose={handleToastClose}
      />
    </>
  );
};

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Get data from Redux store
  const { cart: reduxCart } = useSelector(state => state.cart);
  const { user: reduxUser, guestId: reduxGuestId } = useSelector(state => state.auth);
  const { 
    checkout, 
    order, 
    loading: checkoutLoading,
    paymentLoading,
    finalizeLoading,
    error: checkoutError
  } = useSelector(state => state.checkout);
  
  // Use navigation state if available, otherwise fallback to Redux
  const cartData = location.state?.cartData || {
    products: reduxCart?.products || [],
    totalPrice: reduxCart?.products?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0
  };
  
  const userInfo = location.state?.userInfo || {
    userId: reduxUser?.id || null,
    guestId: reduxUser ? null : reduxGuestId,
    email: reduxUser?.email || null,
    isLoggedIn: !!reduxUser
  };

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  // Clear errors on component mount
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Redirect if no cart data
  useEffect(() => {
    if (!cartData.products || cartData.products.length === 0) {
      navigate('/order-confirmation');
    }
  }, [cartData.products, navigate]);

  // Handle successful order creation
  useEffect(() => {
    if (order) {
      navigate('/order-confirmation', {
        state: {
          paymentDetails: order.paymentDetails,
          orderDetails: {
            products: cartData.products,
            total: cartData.totalPrice,
            shippingAddress,
            orderId: order._id || order.id, // Handle both _id and id
            userInfo
          }
        }
      });
      // Clear checkout state after navigation
      dispatch(clearCheckout());
    }
  }, [order, navigate, cartData, shippingAddress, userInfo, dispatch]);

  const handleCreateCheckout = async (e) => {
    e.preventDefault();
    
    // Clear any previous errors
    dispatch(clearError());
    
    // Validate shipping address
    if (!shippingAddress.firstName || !shippingAddress.address || !shippingAddress.city || 
        !shippingAddress.postalCode || !shippingAddress.country || !shippingAddress.phone) {
      return;
    }

    try {
      // Create proper checkout data that matches backend expectations
      const checkoutData = {
        checkoutItems: cartData.products.map(product => ({
          productId: product.productId || product._id,
          name: product.name,
          image: product.image,
          price: product.price,
          quantity: product.quantity,
          size: product.size,
          color: product.color
        })),
        shippingAddress: {
          address: `${shippingAddress.firstName} ${shippingAddress.lastName}, ${shippingAddress.address}`,
          city: shippingAddress.city,
          postalCode: shippingAddress.postalCode,
          country: shippingAddress.country,
          phone: shippingAddress.phone
        },
        paymentMethod: 'Pending', // Will be updated during payment
        totalPrice: cartData.totalPrice
      };

      await dispatch(createCheckoutSession(checkoutData)).unwrap();
      setShowPaymentModal(true);
    } catch (error) {
      console.error("Checkout session creation failed:", error);
    }
  };

  const handlePaymentSuccess = (order) => {
    setShowPaymentModal(false);
    // The useEffect will handle the navigation when order is set
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    // Clear any payment errors when modal is closed
    dispatch(clearError());
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto py-10 px-6 tracking-tighter">
        {/* Left Section */}
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-semibold uppercase mb-6">Checkout</h2>
          <form onSubmit={handleCreateCheckout}>
            <h3 className="text-lg font-medium mb-4">Contact Details</h3>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                value={userInfo.email || "user@example.com"}
                className="w-full p-2 border rounded bg-gray-100 text-gray-600"
                disabled
              />
            </div>

            <h3 className="text-lg mb-4">Delivery</h3>
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700">First Name</label>
                <input
                  type="text"
                  value={shippingAddress.firstName}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      firstName: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Last Name</label>
                <input
                  type="text"
                  value={shippingAddress.lastName}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      lastName: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">
                Address
              </label>
              <input
                type="text"
                value={shippingAddress.address}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    address: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700">City</label>
                <input
                  type="text"
                  value={shippingAddress.city}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      city: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Postal Code</label>
                <input
                  type="text"
                  value={shippingAddress.postalCode}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      postalCode: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700">Country</label>
              <input
                type="text"
                value={shippingAddress.country}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    country: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700">Phone</label>
              <input
                type="tel"
                value={shippingAddress.phone}
                onChange={(e) =>
                  setShippingAddress({
                    ...shippingAddress,
                    phone: e.target.value,
                  })
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>

            {checkoutError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-red-600 text-sm font-medium">
                  {checkoutError}
                </div>
              </div>
            )}

            <div className="mt-6">
              <button
                type="submit"
                disabled={checkoutLoading}
                className={`w-full py-3 rounded hover:bg-gray-800 transition-colors ${
                  checkoutLoading
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-black text-white'
                }`}
              >
                {checkoutLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  'Continue to Payment'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-2xl font-semibold uppercase mb-6">Order Summary</h3>
          {cartData.products.map((product) => (
            <div
              key={`${product.productId}-${product.size}-${product.color}`}
              className="flex items-start justify-between py-2 border-b mb-4"
            >
              <div className="flex items-start">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-20 h-20 rounded object-cover mr-4"
                />
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-600">
                    {product.size}, {product.color}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-gray-500">Qty: {product.quantity}</p>
                <p className="text-md font-semibold">
                  ₹{product.price?.toLocaleString()}
                </p>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center text-lg mb-2">
            <p>Subtotal</p>
            <p>₹{cartData.totalPrice?.toLocaleString()}</p>
          </div>
          <div className="flex justify-between items-center text-lg mb-2">
            <p>Shipping</p>
            <p className="text-green-600 font-semibold">Free</p>
          </div>
          <div className="flex justify-between items-center text-xl font-bold mt-4 border-t pt-4">
            <p>Total</p>
            <p>₹{cartData.totalPrice?.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {checkout && showPaymentModal && (
        <PaymentOptionsModal
          shippingAddress={shippingAddress}
          cartData={cartData}
          onClose={handleClosePaymentModal}
          onPaymentSuccess={handlePaymentSuccess}
          checkoutId={checkout._id || checkout.id} // Handle both _id and id
          updatePaymentStatus={(...args) => dispatch(updatePaymentStatus(...args))}
          finalizeCheckout={(...args) => dispatch(finalizeCheckout(...args))}
          paymentLoading={paymentLoading}
          finalizeLoading={finalizeLoading}
          error={checkoutError}
        />
      )}
    </>
  );
};

export default Checkout;