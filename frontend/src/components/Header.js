import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flower2, ShoppingCart, User, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import logo from "../assets/images/logo.png";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { cartCount } = useCart();

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-border/40 transition-all">
      <div className="grain-overlay" />
      <nav className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center space-x-2 group" data-testid="logo-link">
           <img
  src={logo}
  alt="Paper N Makers"
  className="h-10 w-auto transition-transform group-hover:scale-105"
/>
            <span className="text-2xl font-heading font-bold tracking-tight text-foreground">
              paper.n.makers
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/products"
              className="text-sm font-medium hover:text-primary transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-primary after:transition-all hover:after:w-full"
              data-testid="products-nav-link"
            >
              Shop Flowers
            </Link>
            <Link
              to="/cart"
              className="relative text-sm font-medium hover:text-primary transition-colors"
              data-testid="cart-nav-link"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center" data-testid="cart-count">
                  {cartCount}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/orders"
                  className="text-sm font-medium hover:text-primary transition-colors"
                  data-testid="orders-nav-link"
                >
                  My Orders
                </Link>
                {user?.is_admin && (
                  <Link
                    to="/admin"
                    className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    data-testid="admin-nav-link"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 text-sm font-medium hover:text-primary transition-colors"
                  data-testid="logout-button"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1 text-sm font-medium hover:text-primary transition-colors"
                data-testid="login-nav-link"
              >
                <User className="w-5 h-5" />
              </Link>
            )}
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-button"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden py-4 space-y-4"
          >
            <Link
              to="/products"
              className="block text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Shop Flowers
            </Link>
            <Link
              to="/cart"
              className="flex items-center space-x-2 text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Cart {cartCount > 0 && `(${cartCount})`}</span>
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/orders"
                  className="block text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Orders
                </Link>
                {user?.is_admin && (
                  <Link
                    to="/admin"
                    className="block text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-1 text-sm font-medium hover:text-primary transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-2 text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="w-5 h-5" />
                <span>Login</span>
              </Link>
            )}
          </motion.div>
        )}
      </nav>
    </header>
  );
};

export default Header;