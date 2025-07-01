import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/slices/cartSlice';
import { Button } from './ui/button';
import { Loader2, Check, ShoppingCart } from 'lucide-react';

const AddToCart = ({ product }) => {
  const dispatch = useDispatch();
  const { user, guestId } = useSelector(state => state.auth);
  const { loading } = useSelector(state => state.cart);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'

  const handleAddToCart = async () => {
    if (!product.inStock) return;
    
    setStatus('loading');
    try {
      await dispatch(addToCart({
        productId: product.id,
        quantity,
        size: selectedSize,
        color: selectedColor,
        userId: user?.id || null,
        guestId: user ? null : guestId
      })).unwrap();
      
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {product.sizes?.length > 0 && (
        <div>
          <h3 className="text-sm font-medium">Size</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {product.sizes.map(size => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-3 py-1 border rounded-md text-sm ${
                  selectedSize === size 
                    ? 'bg-black text-white border-black' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {product.colors?.length > 0 && (
        <div>
          <h3 className="text-sm font-medium">Color</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {product.colors.map(color => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`px-3 py-1 border rounded-md text-sm ${
                  selectedColor === color 
                    ? 'bg-black text-white border-black' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center border rounded-md overflow-hidden">
          <button
            onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
            disabled={quantity <= 1}
            className="px-3 py-2 bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
          >
            -
          </button>
          <span className="px-3 py-2 min-w-[40px] text-center">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(prev => prev + 1)}
            className="px-3 py-2 bg-gray-50 hover:bg-gray-100"
          >
            +
          </button>
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={status === 'loading' || !product.inStock}
          className="flex-1 gap-2"
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Adding...
            </>
          ) : status === 'success' ? (
            <>
              <Check className="w-4 h-4" />
              Added!
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </>
          )}
        </Button>
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-500">Failed to add item to cart</p>
      )}
    </div>
  );
};

export default AddToCart;