import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, Search, Filter } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

const API =  `${process.env.REACT_APP_BACKEND_URL}/api`;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedOccasion, setSelectedOccasion] = useState(searchParams.get('occasion') || 'all');
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategory, selectedOccasion]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (selectedOccasion !== 'all') {
      filtered = filtered.filter(product => product.occasion === selectedOccasion);
    }

    setFilteredProducts(filtered);
  };

  const handleAddToCart = (productId) => {
    addToCart(productId, 1);
    toast.success('Added to cart!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading flowers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24" data-testid="products-page">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-heading font-semibold tracking-tight mb-4">
            Our Collection
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            Discover the perfect blooms for every occasion
          </p>
        </motion.div>

        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search flowers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border-border bg-white/50 pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              data-testid="search-input"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-xl border-border bg-white px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                data-testid="category-filter"
              >
                <option value="all">All Categories</option>
                <option value="bouquet">Bouquets</option>
                <option value="single">Single Flowers</option>
                <option value="arrangement">Arrangements</option>
              </select>
            </div>

            <select
              value={selectedOccasion}
              onChange={(e) => setSelectedOccasion(e.target.value)}
              className="rounded-xl border-border bg-white px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              data-testid="occasion-filter"
            >
              <option value="all">All Occasions</option>
              <option value="love">Love & Romance</option>
              <option value="joy">Joy & Celebration</option>
              <option value="sympathy">Sympathy</option>
              <option value="birthday">Birthday</option>
              <option value="anniversary">Anniversary</option>
            </select>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No flowers found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className={index % 2 === 1 ? 'translate-y-4' : ''}
              >
                <div className="group relative overflow-hidden rounded-2xl bg-white border border-border/50 transition-all hover:shadow-xl hover:border-primary/20">
                  <Link to={`/products/${product.id}`}>
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                    </div>
                  </Link>
                  
                  <div className="p-6">
                    <Link to={`/products/${product.id}`}>
                      <h3 className="text-xl font-heading font-medium mb-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-heading font-bold text-primary">
                        ₹{product.price}
                      </span>
                      <button
                        onClick={() => handleAddToCart(product.id)}
                        className="rounded-full bg-primary text-white p-3 transition-all hover:scale-105 hover:shadow-lg active:scale-95"
                        data-testid={`add-to-cart-${product.id}`}
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;