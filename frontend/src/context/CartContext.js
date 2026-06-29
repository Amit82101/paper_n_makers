import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '../services/apiServices';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        setCart(JSON.parse(localCart));
      }
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      const response = await cartService.get();
      setCart(response.data.items || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    const existingItem = cart.find(item => item.product_id === productId);
    let newCart;
    
    if (existingItem) {
      newCart = cart.map(item =>
        item.product_id === productId
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      newCart = [...cart, { product_id: productId, quantity }];
    }

    setCart(newCart);

    if (isAuthenticated) {
      try {
        await cartService.update(newCart);
      } catch (error) {
        console.error('Error updating cart:', error);
      }
    } else {
      localStorage.setItem('cart', JSON.stringify(newCart));
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const newCart = cart.map(item =>
      item.product_id === productId ? { ...item, quantity } : item
    );

    setCart(newCart);

    if (isAuthenticated) {
      try {
        await cartService.update(newCart);
      } catch (error) {
        console.error('Error updating cart:', error);
      }
    } else {
      localStorage.setItem('cart', JSON.stringify(newCart));
    }
  };

  const removeFromCart = async (productId) => {
    const newCart = cart.filter(item => item.product_id !== productId);
    setCart(newCart);

    if (isAuthenticated) {
      try {
        await cartService.update(newCart);
      } catch (error) {
        console.error('Error updating cart:', error);
      }
    } else {
      localStorage.setItem('cart', JSON.stringify(newCart));
    }
  };

  const clearCart = async () => {
    setCart([]);
    if (isAuthenticated) {
      try {
        await cartService.update([]);
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    } else {
      localStorage.removeItem('cart');
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};