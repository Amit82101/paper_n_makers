import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Package, Calendar, MapPin, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL
  ? `${process.env.REACT_APP_BACKEND_URL}/api`
  : "http://localhost:8000/api";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders`);
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'confirmed':
        return 'bg-secondary/20 text-secondary-foreground';
      case 'pending':
        return 'bg-accent/20 text-foreground';
      case 'failed':
        return 'bg-destructive/20 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen py-24" data-testid="orders-page">
        <div className="container mx-auto px-4 md:px-8 max-w-7xl">
          <div className="text-center py-16">
            <Package className="w-24 h-24 text-muted-foreground/30 mx-auto mb-6" />
            <h2 className="text-3xl font-heading font-semibold mb-4">No orders yet</h2>
            <p className="text-muted-foreground mb-8">Start shopping for beautiful flowers!</p>
            <Link
              to="/products"
              className="inline-flex items-center rounded-full bg-primary text-white px-8 py-4 font-medium transition-all hover:scale-105 hover:shadow-lg active:scale-95"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24" data-testid="orders-page">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-heading font-semibold tracking-tight mb-4">
            My Orders
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'} found
          </p>
        </motion.div>

        <div className="space-y-6">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-xl p-8 border border-border shadow-sm"
              data-testid={`order-${order.id}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-heading font-semibold mb-2">
                    Order #{order.id.slice(0, 8)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(order.created_at), 'PPP')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${getStatusColor(order.payment_status)}`}>
                    {order.payment_status}
                  </span>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${getStatusColor(order.order_status)}`}>
                    {order.order_status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="text-sm font-medium">Delivery</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(order.delivery_date), 'PPP')} at {order.delivery_time}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="text-sm font-medium">{order.recipient_name}</p>
                    <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
                  </div>
                </div>
              </div>

              {order.gift_message && (
                <div className="flex items-start space-x-3 mb-6 p-4 bg-muted/30 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="text-sm font-medium mb-1">Gift Message</p>
                    <p className="text-sm text-muted-foreground italic">"{order.gift_message}"</p>
                  </div>
                </div>
              )}

              <div className="border-t border-border pt-4 flex items-center justify-between">
                <span className="text-2xl font-heading font-bold text-primary">
                  ₹{order.total_amount.toFixed(2)}
                </span>
                <Link
                  to={`/orders/${order.id}`}
                  className="rounded-full bg-primary/10 text-primary px-6 py-2 font-medium hover:bg-primary/20 transition-colors"
                  data-testid={`view-order-${order.id}`}
                >
                  View Details
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;