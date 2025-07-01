import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import CartContents from "../Cart/CartContents";
import { Loader2 } from "lucide-react";

const CartDrawer = ({ drawerOpen, toggleCartDrawer }) => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { cart } = useSelector(state => state.cart);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = () => {
    if (!cart?.products?.length) return;
    
    setIsCheckingOut(true);
    
    if (!user) {
      navigate('/login', { state: { from: '/cart' } });
    } else {
      navigate('/checkout');
    }
    
    // Small delay to allow navigation before closing drawer
    setTimeout(() => {
      setIsCheckingOut(false);
      toggleCartDrawer();
    }, 300);
  };

  // Calculate total items in cart
  const totalItems = cart?.products?.reduce((total, item) => total + item.quantity, 0) || 0;
  const subtotal = cart?.products?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;

  return (
    <div
      className={`fixed top-0 right-0 w-full sm:w-96 h-full bg-white shadow-lg transform transition-transform duration-300 flex flex-col z-50 ${
        drawerOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header with close button */}
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold">Your Cart ({totalItems})</h2>
        <button 
          onClick={toggleCartDrawer} 
          aria-label="Close Cart"
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <IoMdClose className="h-6 w-6 text-gray-600" />
        </button>
      </div>

      {/* Cart contents with scrollable area */}
      <div className="flex-grow overflow-y-auto">
        <CartContents isDrawer={true} />
      </div>

      {/* Checkout section fixed at the bottom */}
      <div className="p-4 border-t bg-white sticky bottom-0">
        <div className="flex justify-between mb-4">
          <span className="font-medium">Subtotal</span>
          <span className="font-bold">${subtotal.toFixed(2)}</span>
        </div>
        <button
          onClick={handleCheckout}
          disabled={!cart?.products?.length || isCheckingOut}
          className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
            cart?.products?.length 
              ? "bg-black text-white hover:bg-gray-800" 
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isCheckingOut ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Checkout"
          )}
        </button>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Shipping, taxes, and discount codes calculated at checkout.
        </p>
      </div>
    </div>
  );
};

export default CartDrawer;