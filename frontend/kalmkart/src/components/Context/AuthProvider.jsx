import { createContext, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, mergeCarts } from '../redux/slices/cartSlice';
import { logout, generateNewGuestId } from '../redux/slices/authSlice';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, guestId, isLoggedIn } = useSelector(state => state.auth);
  const { cart } = useSelector(state => state.cart);

  // Handle cart synchronization when auth state changes
  useEffect(() => {
    const syncCart = async () => {
      try {
        if (isLoggedIn && user) {
          // User is logged in - fetch their cart
          await dispatch(fetchCart({ userId: user.id }));
          
          // Check if there's a local guest cart to merge
          const localCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
          if (localCart.length > 0) {
            await dispatch(mergeCarts({
              userId: user.id,
              guestCart: localCart
            }));
            localStorage.removeItem('guestCart');
          }
        } else if (guestId) {
          // User is guest - fetch guest cart
          await dispatch(fetchCart({ guestId }));
        }
      } catch (error) {
        console.error("Cart synchronization failed:", error);
      }
    };

    syncCart();
  }, [user, guestId, isLoggedIn, dispatch]);

  const handleLogout = async () => {
    // Save current cart to guest storage if not empty
    if (cart?.products?.length > 0) {
      localStorage.setItem('guestCart', JSON.stringify(cart.products));
    }
    await dispatch(logout());
    dispatch(generateNewGuestId());
    dispatch(clearCart({})); // Clear the cart in Redux store
  };

  return (
    <AuthContext.Provider value={{ handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);