import React, { useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updatePaymentStatus, finalizeCheckout } from '../../redux/slices/checkoutSlice';
import { X, CheckCircle, Clock, ChevronRight } from 'lucide-react';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { checkoutId, shippingAddress, cartData } = location.state || {};
  const { order, paymentLoading, finalizeLoading, paymentError } = useSelector(state => state.checkout);
  const [selectedPayment, setSelectedPayment] = useState('upi');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!checkoutId) {
      navigate('/checkout');
    }
  }, [checkoutId, navigate]);

  useEffect(() => {
    if (order) {
      navigate('/order-confirmation', {
        state: {
          orderDetails: order,
          cartData,
          shippingAddress
        }
      });
    }
  }, [order, navigate, cartData, shippingAddress]);

  const handlePayment = async () => {
    try {
      // Update payment status
      await dispatch(updatePaymentStatus({
        checkoutId,
        paymentStatus: 'Paid',
        paymentDetails: {
          method: selectedPayment,
          transactionId: `txn_${Date.now()}`,
          amount: cartData.totalPrice
        }
      })).unwrap();

      // Finalize checkout
      await dispatch(finalizeCheckout(checkoutId)).unwrap();
      
      setShowToast(true);
    } catch (error) {
      console.error("Payment processing failed:", error);
    }
  };

  if (!checkoutId) return null;

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      {/* Payment Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Complete Your Payment</h1>
        <button onClick={() => navigate('/checkout')} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>

      {/* Payment Progress */}
      <div className="flex justify-between items-center mb-10 relative">
        <div className="flex flex-col items-center z-10 bg-white px-4">
          <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">1</div>
          <span className="mt-2 text-sm">Shipping</span>
        </div>
        <div className="flex flex-col items-center z-10 bg-white px-4">
          <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">2</div>
          <span className="mt-2 text-sm font-medium">Payment</span>
        </div>
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-1"></div>
      </div>

      {/* Payment Options */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Select Payment Method</h2>
        
        <div className="space-y-4">
          {/* UPI Option */}
          <div 
            className={`p-4 border rounded-lg cursor-pointer ${selectedPayment === 'upi' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
            onClick={() => setSelectedPayment('upi')}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-10 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-md mr-3"></div>
                <span className="font-medium">UPI</span>
              </div>
              {selectedPayment === 'upi' && <CheckCircle className="text-blue-500" />}
            </div>
          </div>

          {/* Card Option */}
          <div 
            className={`p-4 border rounded-lg cursor-pointer ${selectedPayment === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
            onClick={() => setSelectedPayment('card')}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-10 h-6 bg-gradient-to-r from-red-500 to-orange-500 rounded-md mr-3"></div>
                <span className="font-medium">Credit/Debit Card</span>
              </div>
              {selectedPayment === 'card' && <CheckCircle className="text-blue-500" />}
            </div>
          </div>

          {/* Net Banking Option */}
          <div 
            className={`p-4 border rounded-lg cursor-pointer ${selectedPayment === 'netbanking' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
            onClick={() => setSelectedPayment('netbanking')}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-10 h-6 bg-gradient-to-r from-green-500 to-teal-500 rounded-md mr-3"></div>
                <span className="font-medium">Net Banking</span>
              </div>
              {selectedPayment === 'netbanking' && <CheckCircle className="text-blue-500" />}
            </div>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        <div className="space-y-3">
          {cartData.products.map((item) => (
            <div key={item.productId} className="flex justify-between">
              <span>{item.name} × {item.quantity}</span>
              <span>₹{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="border-t pt-3 flex justify-between font-medium">
            <span>Total</span>
            <span>₹{cartData.totalPrice.toLocaleString()}</span>
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={paymentLoading || finalizeLoading}
          className={`w-full mt-6 py-3 rounded-lg font-medium ${
            paymentLoading || finalizeLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-black text-white hover:bg-gray-800'
          }`}
        >
          {paymentLoading ? 'Processing Payment...' : 
           finalizeLoading ? 'Creating Order...' : 'Pay Now'}
        </button>

        {paymentError && (
          <div className="mt-3 text-red-500 text-center">{paymentError}</div>
        )}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center animate-fade-in">
          <CheckCircle className="mr-2" />
          <span>Payment successful! Redirecting to order confirmation...</span>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;