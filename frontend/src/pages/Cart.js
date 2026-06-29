import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { productService } from '../services/apiServices';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [cart]);

  const fetchProducts = async () => {
    try {
      const productIds = cart.map(item => item.product_id);
      const productPromises = productIds.map(id => productService.getById(id));
      const responses = await Promise.all(productPromises);
      
      const productsMap = {};
      responses.forEach(response => {
        productsMap[response.data.id] = response.data;
      });
      
      setProducts(productsMap);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const product = products[item.product_id];
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please login to proceed to checkout');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen py-24" data-testid="cart-page">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <div className="text-center py-16">
            <ShoppingBag className="w-24 h-24 text-muted-foreground/30 mx-auto mb-6" />
            <h2 className="text-3xl font-heading font-semibold mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">Add some beautiful flowers to get started!</p>
            <Link
              to="/products"
              className="inline-flex items-center rounded-full bg-primary text-white px-8 py-4 font-medium transition-all hover:scale-105 hover:shadow-lg active:scale-95"
              data-testid="continue-shopping-button"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24" data-testid="cart-page">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-heading font-semibold tracking-tight mb-4">
            Shopping Cart
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            {cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              const product = products[item.product_id];
              if (!product) return null;

              return (
                <motion.div
                  key={item.product_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-xl p-6 border border-border shadow-sm"
                  data-testid={`cart-item-${item.product_id}`}
                >
                  <div className="flex gap-6">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <Link to={`/products/${product.id}`}>
                        <h3 className="text-xl font-heading font-medium mb-2 hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-muted-foreground text-sm mb-4">
                        ₹{product.price} each
                      </p>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center border border-border rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            className="p-2 hover:bg-muted transition-colors"
                            data-testid={`decrease-${item.product_id}`}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-2 font-medium" data-testid={`quantity-${item.product_id}`}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            className="p-2 hover:bg-muted transition-colors"
                            data-testid={`increase-${item.product_id}`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => {
                            removeFromCart(item.product_id);
                            toast.success('Removed from cart');
                          }}
                          className="text-destructive hover:text-destructive/80 transition-colors"
                          data-testid={`remove-${item.product_id}`}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-heading font-bold text-primary">
                        ₹{(product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl p-8 border border-border shadow-sm sticky top-24"
            >
              <h2 className="text-2xl font-heading font-semibold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery</span>
                  <span className="text-secondary">FREE</span>
                </div>
                <div className="border-t border-border pt-4 flex justify-between text-xl font-heading font-bold">
                  <span>Total</span>
                  <span className="text-primary" data-testid="cart-total">₹{calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full rounded-full bg-primary text-white px-8 py-4 font-medium transition-all hover:scale-105 hover:shadow-lg active:scale-95 mb-4"
                data-testid="checkout-button"
              >
                Proceed to Checkout
              </button>

              <Link
                to="/products"
                className="block text-center text-sm text-primary hover:underline"
              >
                Continue Shopping
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;