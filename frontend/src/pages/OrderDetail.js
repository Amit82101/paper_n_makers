import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { orderService, productService } from '../services/apiServices';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, MessageSquare, Package, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState(null);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrder();
    }
  }, [id, isAuthenticated]);

  const fetchOrder = async () => {
    try {
      const orderResponse = await orderService.getById(id);
      setOrder(orderResponse.data);

      const productPromises = orderResponse.data.items.map(item =>
        productService.getById(item.product_id)
      );
      const productResponses = await Promise.all(productPromises);

      const productsMap = {};
      productResponses.forEach(response => {
        productsMap[response.data.id] = response.data;
      });

      setProducts(productsMap);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Order not found');
      navigate('/orders');
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
          <p className="text-muted-foreground">Loading order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24" data-testid="order-detail-page">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Orders</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-heading font-semibold tracking-tight mb-4">
            Order #{order.id.slice(0, 8)}
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            Placed on {format(new Date(order.created_at), 'PPP')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl p-8 border border-border shadow-sm">
              <h2 className="text-2xl font-heading font-semibold mb-6">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => {
                  const product = products[item.product_id];
                  if (!product) return null;

                  return (
                    <div key={item.product_id} className="flex gap-6">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-heading font-medium mb-2">
                          {product.name}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          ₹{product.price} x {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-heading font-bold text-primary">
                          ₹{(product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-card rounded-xl p-8 border border-border shadow-sm">
              <h2 className="text-2xl font-heading font-semibold mb-6">Delivery Information</h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="text-sm font-medium">Scheduled Delivery</p>
                    <p className="text-muted-foreground">
                      {format(new Date(order.delivery_date), 'PPP')} at {order.delivery_time}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="text-sm font-medium">Delivery Address</p>
                    <p className="text-muted-foreground">{order.recipient_name}</p>
                    <p className="text-muted-foreground">{order.recipient_phone}</p>
                    <p className="text-muted-foreground">{order.delivery_address}</p>
                  </div>
                </div>

                {order.gift_message && (
                  <div className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <p className="text-sm font-medium mb-1">Gift Message</p>
                      <p className="text-muted-foreground italic">"{order.gift_message}"</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl p-8 border border-border shadow-sm sticky top-24">
              <h2 className="text-2xl font-heading font-semibold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-3">
                  <Package className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="text-sm font-medium">Order Status</p>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(order.order_status)}`}>
                      {order.order_status}
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Package className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="text-sm font-medium">Payment Status</p>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(order.payment_status)}`}>
                      {order.payment_status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <div className="flex justify-between text-muted-foreground mb-2">
                  <span>Subtotal</span>
                  <span>₹{order.total_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground mb-4">
                  <span>Delivery</span>
                  <span className="text-secondary">FREE</span>
                </div>
                <div className="flex justify-between text-2xl font-heading font-bold">
                  <span>Total</span>
                  <span className="text-primary">₹{order.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;