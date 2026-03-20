import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'bouquet',
    image: '',
    stock: 100,
    occasion: 'love'
  });

  useEffect(() => {
    if (!user?.is_admin) {
      navigate('/');
      toast.error('Access denied');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        axios.get(`${API}/products`),
        axios.get(`${API}/orders`)
      ]);
      setProducts(productsRes.data);
      setOrders(ordersRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await axios.put(`${API}/products/${editingProduct.id}`, {
          ...productForm,
          price: parseFloat(productForm.price),
          stock: parseInt(productForm.stock)
        });
        toast.success('Product updated successfully');
      } else {
        await axios.post(`${API}/products`, {
          ...productForm,
          price: parseFloat(productForm.price),
          stock: parseInt(productForm.stock)
        });
        toast.success('Product created successfully');
      }
      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        price: '',
        category: 'bouquet',
        image: '',
        stock: 100,
        occasion: 'love'
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to save product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`${API}/products/${id}`);
      toast.success('Product deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      image: product.image,
      stock: product.stock,
      occasion: product.occasion || 'love'
    });
    setShowProductForm(true);
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`${API}/orders/${orderId}/status?order_status=${status}`);
      toast.success('Order status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update order status');
    }
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
    <div className="min-h-screen py-24" data-testid="admin-page">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-heading font-semibold tracking-tight mb-4">
            Admin Panel
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            Manage products and orders
          </p>
        </motion.div>

        <div className="flex space-x-4 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-4 px-4 font-medium transition-colors ${
              activeTab === 'products'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            data-testid="products-tab"
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-4 px-4 font-medium transition-colors ${
              activeTab === 'orders'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            data-testid="orders-tab"
          >
            Orders ({orders.length})
          </button>
        </div>

        {activeTab === 'products' && (
          <div>
            <div className="mb-6">
              <button
                onClick={() => {
                  setShowProductForm(!showProductForm);
                  setEditingProduct(null);
                  setProductForm({
                    name: '',
                    description: '',
                    price: '',
                    category: 'bouquet',
                    image: '',
                    stock: 100,
                    occasion: 'love'
                  });
                }}
                className="inline-flex items-center space-x-2 rounded-full bg-primary text-white px-6 py-3 font-medium transition-all hover:scale-105 hover:shadow-lg"
                data-testid="add-product-button"
              >
                <Plus className="w-5 h-5" />
                <span>Add Product</span>
              </button>
            </div>

            {showProductForm && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-xl p-8 border border-border shadow-sm mb-8"
              >
                <h2 className="text-2xl font-heading font-semibold mb-6">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <form onSubmit={handleProductSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Product Name *</label>
                      <input
                        type="text"
                        required
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        className="w-full rounded-xl border-border bg-white/50 px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        data-testid="product-name-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Price *</label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        className="w-full rounded-xl border-border bg-white/50 px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        data-testid="product-price-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description *</label>
                    <textarea
                      required
                      rows={3}
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      className="w-full rounded-xl border-border bg-white/50 px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      data-testid="product-description-input"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Category *</label>
                      <select
                        required
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        className="w-full rounded-xl border-border bg-white px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        data-testid="product-category-select"
                      >
                        <option value="bouquet">Bouquet</option>
                        <option value="single">Single Flower</option>
                        <option value="arrangement">Arrangement</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Occasion</label>
                      <select
                        value={productForm.occasion}
                        onChange={(e) => setProductForm({ ...productForm, occasion: e.target.value })}
                        className="w-full rounded-xl border-border bg-white px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        data-testid="product-occasion-select"
                      >
                        <option value="love">Love & Romance</option>
                        <option value="joy">Joy & Celebration</option>
                        <option value="sympathy">Sympathy</option>
                        <option value="birthday">Birthday</option>
                        <option value="anniversary">Anniversary</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Stock *</label>
                      <input
                        type="number"
                        required
                        value={productForm.stock}
                        onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) })}
                        className="w-full rounded-xl border-border bg-white/50 px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        data-testid="product-stock-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Image URL *</label>
                    <input
                      type="url"
                      required
                      value={productForm.image}
                      onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                      className="w-full rounded-xl border-border bg-white/50 px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      data-testid="product-image-input"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="rounded-full bg-primary text-white px-8 py-3 font-medium transition-all hover:scale-105 hover:shadow-lg"
                      data-testid="save-product-button"
                    >
                      {editingProduct ? 'Update Product' : 'Create Product'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProductForm(false);
                        setEditingProduct(null);
                      }}
                      className="rounded-full border-2 border-border bg-transparent px-8 py-3 font-medium hover:bg-muted transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-card rounded-xl border border-border shadow-sm overflow-hidden"
                  data-testid={`product-card-${product.id}`}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-heading font-medium mb-2">{product.name}</h3>
                    <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-heading font-bold text-primary">
                        ₹{product.price}
                      </span>
                      <span className="text-sm text-muted-foreground">Stock: {product.stock}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="flex-1 flex items-center justify-center space-x-1 rounded-lg bg-primary/10 text-primary px-4 py-2 hover:bg-primary/20 transition-colors"
                        data-testid={`edit-product-${product.id}`}
                      >
                        <Pencil className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="flex-1 flex items-center justify-center space-x-1 rounded-lg bg-destructive/10 text-destructive px-4 py-2 hover:bg-destructive/20 transition-colors"
                        data-testid={`delete-product-${product.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-card rounded-xl p-6 border border-border shadow-sm"
                data-testid={`admin-order-${order.id}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-heading font-semibold mb-1">
                      Order #{order.id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {order.recipient_name} - {order.delivery_date}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-xl font-heading font-bold text-primary">
                      ₹{order.total_amount.toFixed(2)}
                    </span>
                    <select
                      value={order.order_status}
                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                      className="rounded-lg border-border bg-white px-4 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all capitalize"
                      data-testid={`order-status-${order.id}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;