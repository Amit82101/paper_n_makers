import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { ShoppingCart, Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API}/products/${id}`);
      setProduct(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Product not found');
      navigate('/products');
    }
  };

  const handleAddToCart = () => {
    addToCart(product.id, quantity);
    toast.success(`Added ${quantity} item(s) to cart!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24" data-testid="product-detail-page">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col justify-center"
          >
            <div className="mb-4">
              <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium capitalize">
                {product.category}
              </span>
              {product.occasion && (
                <span className="inline-block ml-2 px-4 py-1 rounded-full bg-secondary/20 text-secondary-foreground text-sm font-medium capitalize">
                  {product.occasion}
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-heading font-semibold tracking-tight mb-4">
              {product.name}
            </h1>

            <p className="text-lg md:text-xl leading-relaxed text-muted-foreground mb-6">
              {product.description}
            </p>

            <div className="text-5xl font-heading font-bold text-primary mb-8">
              ₹{product.price}
            </div>

            <div className="flex items-center space-x-4 mb-8">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center border border-border rounded-xl">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-muted transition-colors"
                  data-testid="decrease-quantity"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="px-6 py-3 font-medium" data-testid="quantity-display">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-muted transition-colors"
                  data-testid="increase-quantity"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="inline-flex items-center justify-center space-x-2 rounded-full bg-primary text-white px-8 py-4 font-medium transition-all hover:scale-105 hover:shadow-lg active:scale-95 w-full md:w-auto"
              data-testid="add-to-cart-button"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Add to Cart</span>
            </button>

            <div className="mt-8 p-6 bg-muted/30 rounded-xl">
              <h3 className="font-medium mb-2">Delivery Information</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Choose your preferred delivery date and time at checkout</li>
                <li>• Add a personalized gift message</li>
                <li>• Same-day delivery available</li>
                <li>• Freshness guaranteed</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;