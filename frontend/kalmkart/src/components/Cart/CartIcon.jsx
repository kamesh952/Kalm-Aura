import { useSelector } from 'react-redux';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

const CartIcon = () => {
  const { cart } = useSelector(state => state.cart);
  const itemCount = cart?.products?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <Link to="/cart" className="relative">
      <ShoppingCart className="w-6 h-6" />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </Link>
  );
};

export default CartIcon;