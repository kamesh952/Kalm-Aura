import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FiTrash2 } from 'react-icons/fi';
import { 
  updateCartItem, 
  removeCartItem, 
  fetchCart,
  mergeCarts,
  clearLocalCart,
  clearCartError,
  clearCart,
  setItemLoading,
  updateLocalCartItem,
  removeLocalCartItem,
  setGuestCart
} from '../../redux/slices/cartSlice';
import { createCheckoutSession } from '../../redux/slices/checkoutSlice';
import { Loader2, Check, X, ShoppingCart, AlertCircle, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui';
import { Link, useNavigate } from 'react-router-dom';

// Debug Panel Component
const DebugPanel = ({ user, isAuthenticated, currentUserId, currentGuestId, cart, localCart, effectiveCart, cartLoading }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="mb-6 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="text-sm">
            {isAuthenticated ? (
              <span className="font-medium text-blue-800">
                Debug: {user?.name || user?.email || 'Authenticated User'}
              </span>
            ) : (
              <span className="font-medium text-amber-700">Debug: Guest User</span>
            )}
          </div>
        </div>
        
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
        >
          <Eye className="w-3 h-3" />
          View Details
          {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {showDetails && (
        <div className="mt-3 pt-3 border-t border-blue-200">
          <iframe
            srcDoc={`
              <!DOCTYPE html>
              <html>
                <head>
                  <style>
                    body { 
                      font-family: 'Monaco', 'Menlo', monospace; 
                      font-size: 11px; 
                      background: #f8fafc; 
                      margin: 0; 
                      padding: 12px;
                      color: #374151;
                    }
                    .section { 
                      background: white; 
                      border-radius: 6px; 
                      padding: 12px; 
                      margin-bottom: 12px; 
                      border: 1px solid #e5e7eb;
                      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                    }
                    .section-title { 
                      font-weight: bold; 
                      color: #1f2937; 
                      margin-bottom: 8px; 
                      font-size: 12px;
                      border-bottom: 1px solid #e5e7eb;
                      padding-bottom: 4px;
                    }
                    .row { 
                      display: flex; 
                      justify-content: space-between; 
                      margin: 4px 0; 
                      padding: 2px 0;
                    }
                    .label { 
                      color: #6b7280; 
                      font-weight: 500;
                    }
                    .value { 
                      color: #1f2937; 
                      font-weight: bold;
                    }
                    .badge { 
                      padding: 2px 6px; 
                      border-radius: 12px; 
                      font-size: 10px; 
                      font-weight: bold;
                    }
                    .success { 
                      background: #dcfce7; 
                      color: #166534; 
                    }
                    .warning { 
                      background: #fef3c7; 
                      color: #92400e; 
                    }
                    .info { 
                      background: #dbeafe; 
                      color: #1e40af; 
                    }
                    pre { 
                      background: #f3f4f6; 
                      padding: 8px; 
                      border-radius: 4px; 
                      overflow-x: auto; 
                      font-size: 10px;
                      border: 1px solid #d1d5db;
                    }
                    .item-preview {
                      padding: 4px 8px;
                      background: #f9fafb;
                      border-radius: 4px;
                      margin: 2px 0;
                      border-left: 3px solid #3b82f6;
                      font-size: 10px;
                    }
                  </style>
                </head>
                <body>
                  <div class="section">
                    <div class="section-title">🔐 Authentication Status</div>
                    <div class="row">
                      <span class="label">Status:</span>
                      <span class="badge ${isAuthenticated ? 'success' : 'warning'}">
                        ${isAuthenticated ? '✓ Authenticated' : '⚠ Guest Mode'}
                      </span>
                    </div>
                    <div class="row">
                      <span class="label">User ID:</span>
                      <span class="value">${currentUserId || 'None'}</span>
                    </div>
                    <div class="row">
                      <span class="label">Guest ID:</span>
                      <span class="value">${currentGuestId || 'None'}</span>
                    </div>
                  </div>

                  <div class="section">
                    <div class="section-title">🛒 Cart Information</div>
                    <div class="row">
                      <span class="label">Backend Items:</span>
                      <span class="badge info">${cart?.products?.length || 0}</span>
                    </div>
                    <div class="row">
                      <span class="label">Local Items:</span>
                      <span class="badge info">${localCart.length}</span>
                    </div>
                    <div class="row">
                      <span class="label">Effective Items:</span>
                      <span class="badge success">${effectiveCart.length}</span>
                    </div>
                    <div class="row">
                      <span class="label">Loading:</span>
                      <span class="badge ${cartLoading ? 'warning' : 'success'}">
                        ${cartLoading ? '⟳ Loading' : '✓ Idle'}
                      </span>
                    </div>
                  </div>

                  ${user ? `
                    <div class="section">
                      <div class="section-title">👤 User Object</div>
                      <pre>${JSON.stringify(user, null, 2)}</pre>
                    </div>
                  ` : ''}

                  ${effectiveCart.length > 0 ? `
                    <div class="section">
                      <div class="section-title">📦 Cart Items (${effectiveCart.length})</div>
                      ${effectiveCart.slice(0, 5).map(item => `
                        <div class="item-preview">
                          <strong>${item.name || 'Unnamed'}</strong><br>
                          Size: ${item.size || 'N/A'} | Color: ${item.color || 'N/A'} | Qty: ${item.quantity || 1}<br>
                          Source: ${item.isFromBackend ? 'Backend' : 'Local'} | Price: ₹${item.price || 0}
                        </div>
                      `).join('')}
                      ${effectiveCart.length > 5 ? `<div style="text-align: center; color: #6b7280; margin-top: 8px;">... and ${effectiveCart.length - 5} more items</div>` : ''}
                    </div>
                  ` : ''}
                </body>
              </html>
            `}
            className="w-full h-64 border border-gray-200 rounded-md"
            title="Debug Information"
          />
        </div>
      )}
    </div>
  );
};

const CartContents = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get auth state from Redux store
  const { user, guestId } = useSelector((state) => state.auth);
  
  const { 
    cart, 
    loading: cartLoading, 
    error,
    itemLoading
  } = useSelector((state) => state.cart);
  
  const [localCart, setLocalCart] = useState([]);
  const [successItems, setSuccessItems] = useState({});

  // Derived state from auth slice
  const isAuthenticated = !!user;
  const currentUserId = user?.id || user?._id;
  const currentGuestId = guestId;

  // Initialize local cart from localStorage
  useEffect(() => {
    try {
      const storedCart = JSON.parse(localStorage.getItem('localCart') || '[]');
      setLocalCart(Array.isArray(storedCart) ? storedCart : []);
    } catch (error) {
      console.error('Error parsing local cart:', error);
      setLocalCart([]);
      localStorage.setItem('localCart', '[]');
    }
  }, []);

  // Fetch cart from backend when user or guest ID changes
  useEffect(() => {
    if (currentUserId || currentGuestId) {
      dispatch(fetchCart({ 
        userId: currentUserId, 
        guestId: currentGuestId 
      }));
    }
  }, [dispatch, currentUserId, currentGuestId]);

  // Merge local cart with backend cart when user logs in
  useEffect(() => {
    if (isAuthenticated && localCart.length > 0 && currentUserId) {
      handleCartMerge();
    }
  }, [isAuthenticated, currentUserId]);

  const handleCartMerge = async () => {
    try {
      // Merge carts on backend
      await dispatch(mergeCarts({
        userId: currentUserId,
        guestId: currentGuestId,
        localCart: localCart
      })).unwrap();
      
      // Clear local cart after successful merge
      setLocalCart([]);
      localStorage.setItem('localCart', '[]');
      
      // Force refresh cart to get updated merged data
      await dispatch(fetchCart({ userId: currentUserId, guestId: null })).unwrap();
      
    } catch (error) {
      console.error('Failed to merge carts:', error);
      // On merge failure, still try to fetch the current cart
      dispatch(fetchCart({ userId: currentUserId, guestId: null }));
    }
  };

  // Get effective cart items
  const getEffectiveCart = useCallback(() => {
    // Always check for backend cart items first
    const backendItems = (cart?.products || []).map(item => ({
      ...item,
      isFromBackend: true
    }));

    if (isAuthenticated) {
      // For authenticated users, return backend cart items
      return backendItems;
    } else {
      // For guests, combine local and backend carts
      const localItems = localCart.map(item => ({
        ...item,
        isFromBackend: false
      }));
      
      // Merge and deduplicate
      const allItems = [...backendItems, ...localItems];
      const mergedItems = allItems.reduce((acc, item) => {
        const existing = acc.find(i => 
          i.productId === item.productId && 
          i.size === item.size && 
          i.color === item.color
        );
        
        if (existing) {
          // Prioritize backend items if they exist
          if (item.isFromBackend) {
            const index = acc.indexOf(existing);
            acc[index] = item;
          } else if (!existing.isFromBackend) {
            existing.quantity += item.quantity;
          }
        } else {
          acc.push(item);
        }
        return acc;
      }, []);
      
      return mergedItems;
    }
  }, [cart, localCart, isAuthenticated]);

  const effectiveCart = getEffectiveCart();

  // Calculate total price
  const totalPrice = effectiveCart.reduce(
    (sum, item) => sum + ((item.price || 0) * (item.quantity || 0)),
    0
  );

  // Save local cart to localStorage
  useEffect(() => {
    if (!isAuthenticated) {
      try {
        localStorage.setItem('localCart', JSON.stringify(localCart));
      } catch (error) {
        console.error('Error saving local cart:', error);
      }
    }
  }, [localCart, isAuthenticated]);

  const handleQuantityChange = async (productId, size, color, isFromBackend, newQuantity) => {
    if (newQuantity < 1) return;
    
    const itemKey = `${productId}-${size}-${color}`;
    
    try {
      if (isFromBackend || isAuthenticated) {
        // Handle backend/authenticated user updates
        dispatch(setItemLoading({ itemKey, loading: true }));
        
        await dispatch(updateCartItem({
          productId,
          quantity: newQuantity,
          size,
          color,
          userId: currentUserId,
          guestId: currentGuestId
        })).unwrap();
        
        // Show success feedback
        setSuccessItems(prev => ({ ...prev, [itemKey]: true }));
        setTimeout(() => setSuccessItems(prev => ({ ...prev, [itemKey]: false })), 2000);
        
        // Refresh cart to ensure consistency
        await dispatch(fetchCart({ 
          userId: currentUserId, 
          guestId: isAuthenticated ? null : currentGuestId 
        })).unwrap();
        
      } else {
        // Handle local cart updates for guests
        setLocalCart(prev => 
          prev.map(item => 
            item.productId === productId && item.size === size && item.color === color
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Failed to update quantity:", error);
    } finally {
      if (isFromBackend || isAuthenticated) {
        dispatch(setItemLoading({ itemKey, loading: false }));
      }
    }
  };

  const handleRemoveItem = async (productId, size, color, isFromBackend) => {
    const itemKey = `${productId}-${size}-${color}`;
    
    try {
      if (isFromBackend || isAuthenticated) {
        // Handle backend/authenticated user removal
        dispatch(setItemLoading({ itemKey, loading: true }));
        
        await dispatch(removeCartItem({
          productId,
          size,
          color,
          userId: currentUserId,
          guestId: currentGuestId
        })).unwrap();
        
        // Refresh cart to ensure consistency
        await dispatch(fetchCart({ 
          userId: currentUserId, 
          guestId: isAuthenticated ? null : currentGuestId 
        })).unwrap();
        
      } else {
        // Handle local cart removal for guests
        setLocalCart(prev => 
          prev.filter(item => 
            !(item.productId === productId && item.size === size && item.color === color)
          )
        );
      }
    } catch (error) {
      console.error("Failed to remove item:", error);
      // Refresh cart on error to restore correct state
      if (isFromBackend || isAuthenticated) {
        dispatch(fetchCart({ 
          userId: currentUserId, 
          guestId: isAuthenticated ? null : currentGuestId 
        }));
      }
    } finally {
      if (isFromBackend || isAuthenticated) {
        dispatch(setItemLoading({ itemKey, loading: false }));
      }
    }
  };

  const handleClearCart = async () => {
    try {
      if (isAuthenticated) {
        await dispatch(clearCart({ userId: currentUserId })).unwrap();
      } else {
        await dispatch(clearCart({ guestId: currentGuestId })).unwrap();
      }
      
      // Also clear local cart
      setLocalCart([]);
      localStorage.setItem('localCart', '[]');
      
      // Refresh cart
      dispatch(fetchCart({ 
        userId: currentUserId, 
        guestId: isAuthenticated ? null : currentGuestId 
      }));
    } catch (error) {
      console.error("Failed to clear cart:", error);
    }
  };

  const handleCheckout = async () => {
    try {
      if (effectiveCart.length === 0) {
        alert('Your cart is empty');
        return;
      }

      // If guest with local items, save to backend first
      if (!isAuthenticated && localCart.length > 0) {
        await dispatch(setGuestCart({
          guestId: currentGuestId,
          cart: localCart
        })).unwrap();
      }

      const checkoutData = {
        items: effectiveCart,
        userId: currentUserId,
        guestId: currentGuestId,
        totalAmount: totalPrice
      };

      const session = await dispatch(createCheckoutSession(checkoutData)).unwrap();
      
      if (session.url) {
        window.location.href = session.url;
      } else {
        navigate('/checkout', { state: { checkoutData } });
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      alert('Checkout failed. Please try again.');
    }
  };

  // Helper to check if item is loading
  const isItemLoading = (productId, size, color) => {
    const itemKey = `${productId}-${size}-${color}`;
    return itemLoading[itemKey] || false;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Shopping Cart</h1>
        {effectiveCart.length > 0 && (
          <button
            onClick={handleClearCart}
            className="text-sm text-red-600 hover:text-red-800 underline"
          >
            Clear Cart
          </button>
        )}
      </div>
      
      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <DebugPanel 
          user={user}
          isAuthenticated={isAuthenticated}
          currentUserId={currentUserId}
          currentGuestId={currentGuestId}
          cart={cart}
          localCart={localCart}
          effectiveCart={effectiveCart}
          cartLoading={cartLoading}
        />
      )}
      
      {/* User Status Indicator */}
      <div className="mb-4 text-sm text-gray-600">
        {isAuthenticated ? (
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            Signed in as {user?.name || user?.email} - Cart synced across devices
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            Guest mode - <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link> to save your cart
          </span>
        )}
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 flex items-center gap-2">
          <X className="w-5 h-5" />
          <span>{error}</span>
          <button 
            onClick={() => dispatch(clearCartError())}
            className="ml-auto text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {cartLoading && effectiveCart.length === 0 ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        </div>
      ) : effectiveCart.length === 0 ? (
        <div className="text-center py-12 space-y-4">
          <ShoppingCart className="w-16 h-16 mx-auto text-gray-400" />
          <div>
            <p className="text-gray-500 text-lg mb-2">Your cart is empty</p>
            <p className="text-gray-400 text-sm">Add some products to get started</p>
          </div>
          <Link to="/collection/:collection">
            <Button variant="outline" className="mt-4">
              Continue Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {effectiveCart.map((item) => {
              const itemKey = `${item.productId}-${item.size}-${item.color}`;
              const processing = isItemLoading(item.productId, item.size, item.color);
              const success = successItems[itemKey];

              return (
                <div 
                  key={itemKey}
                  className="flex items-start gap-4 p-4 border rounded-lg bg-white hover:shadow-sm transition-all"
                >
                  <img
                    src={item.image || '/placeholder-product.jpg'}
                    alt={item.name || 'Product'}
                    className="w-20 h-20 object-cover rounded border"
                    onError={(e) => {
                      e.target.src = '/placeholder-product.jpg';
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{item.name || 'Unnamed Product'}</h3>
                    <p className="text-sm text-gray-600">
                      {item.size || 'N/A'} | {item.color || 'N/A'}
                    </p>
                    <p className="font-semibold mt-1">₹{(item.price || 0).toFixed(2)}</p>
                    
                    {!item.isFromBackend && !isAuthenticated && (
                      <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded mt-1 inline-block">
                        Local only
                      </span>
                    )}

                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center border rounded-md overflow-hidden">
                        <button
                          onClick={() => handleQuantityChange(
                            item.productId,
                            item.size,
                            item.color,
                            item.isFromBackend,
                            Math.max(1, (item.quantity || 1) - 1)
                          )}
                          disabled={processing || (item.quantity || 1) <= 1}
                          className="px-3 py-1 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 min-w-[40px] text-center">
                          {processing ? (
                            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                          ) : success ? (
                            <Check className="w-4 h-4 text-green-500 mx-auto" />
                          ) : (
                            item.quantity || 1
                          )}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(
                            item.productId,
                            item.size,
                            item.color,
                            item.isFromBackend,
                            (item.quantity || 1) + 1
                          )}
                          disabled={processing}
                          className="px-3 py-1 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(
                          item.productId,
                          item.size,
                          item.color,
                          item.isFromBackend
                        )}
                        disabled={processing}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors p-1"
                        title="Remove item"
                      >
                        {processing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <FiTrash2 size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="font-bold whitespace-nowrap">
                    ₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 p-6 bg-gray-50 rounded-lg border">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium">Subtotal ({effectiveCart.length} items)</span>
              <span className="font-bold text-xl">₹{totalPrice.toFixed(2)}</span>
            </div>
            <p className="text-sm text-gray-600 mb-6">Shipping and taxes calculated at checkout</p>
            
            <div className="space-y-3">
             
              
              <Link to="/collection/:collection" className="block">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartContents;