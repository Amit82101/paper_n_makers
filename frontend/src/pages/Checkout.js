import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { orderService, paymentService, productService } from '../services/apiServices';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  

  const [formData, setFormData] = useState({
    delivery_date: '',
    delivery_time: '09:00-12:00',
    recipient_name: '',
    recipient_phone: '',
    delivery_address: '',
    gift_message: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (cart.length === 0) {
      navigate('/cart');
      return;
    }
    fetchData();
  }, [cart, isAuthenticated]);

  const fetchData = async () => {
    try {
      const [productsResponse, keyResponse] = await Promise.all([
        Promise.all(cart.map(item => productService.getById(item.product_id))),
        paymentService.getRazorpayKey()
      ]);

      const productsMap = {};
      productsResponse.forEach(response => {
        productsMap[response.data.id] = response.data;
      });

      setProducts(productsMap);
      setRazorpayKey(keyResponse.data.key);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const product = products[item.product_id];
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);

  try {
    const orderData = {
      ...formData,
      items: cart,
      total_amount: calculateTotal()
    };

    // Save order in database
    await orderService.create(orderData);

    const whatsappNumber = "918210133353";

    const productNames = cart
      .map(item => {
        const product = products[item.product_id];
        return product
          ? `${product.name} x ${item.quantity}`
          : "";
      })
      .filter(Boolean)
      .join(", ");

    const message = `
🌸 New Flower Order

Customer: ${user?.name || ""}
Recipient: ${formData.recipient_name}
Phone: ${formData.recipient_phone}

Address:
${formData.delivery_address}

Products:
${productNames}

Total Amount: ₹${calculateTotal()}

Delivery Date: ${formData.delivery_date}
Delivery Time: ${formData.delivery_time}

Gift Message:
${formData.gift_message || "N/A"}
`;

    const whatsappUrl =
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    clearCart();

    toast.success("Opening WhatsApp...");

    window.open(whatsappUrl, "_blank");

    setSubmitting(false);

  } catch (error) {
    console.error("Error creating order:", error);
    toast.error("Failed to create order");
    setSubmitting(false);
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
    <div className="min-h-screen py-24" data-testid="checkout-page">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-heading font-semibold tracking-tight mb-4">
            Checkout
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            Complete your order
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-card rounded-xl p-8 border border-border shadow-sm">
                <h2 className="text-2xl font-heading font-semibold mb-6">Delivery Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Delivery Date *</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.delivery_date}
                      onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                      className="w-full rounded-xl border-border bg-white/50 px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      data-testid="delivery-date-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Delivery Time *</label>
                    <select
                      required
                      value={formData.delivery_time}
                      onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })}
                      className="w-full rounded-xl border-border bg-white px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      data-testid="delivery-time-select"
                    >
                      <option value="09:00-12:00">9:00 AM - 12:00 PM</option>
                      <option value="12:00-15:00">12:00 PM - 3:00 PM</option>
                      <option value="15:00-18:00">3:00 PM - 6:00 PM</option>
                      <option value="18:00-21:00">6:00 PM - 9:00 PM</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Recipient Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.recipient_name}
                    onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                    className="w-full rounded-xl border-border bg-white/50 px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    data-testid="recipient-name-input"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Recipient Phone *</label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={formData.recipient_phone}
                    onChange={(e) => setFormData({ ...formData, recipient_phone: e.target.value })}
                    className="w-full rounded-xl border-border bg-white/50 px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="10-digit phone number"
                    data-testid="recipient-phone-input"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Delivery Address *</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.delivery_address}
                    onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                    className="w-full rounded-xl border-border bg-white/50 px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    data-testid="delivery-address-input"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Gift Message (Optional)</label>
                  <textarea
                    rows={3}
                    value={formData.gift_message}
                    onChange={(e) => setFormData({ ...formData, gift_message: e.target.value })}
                    className="w-full rounded-xl border-border bg-white/50 px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="Add a personal message..."
                    data-testid="gift-message-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-primary text-white px-8 py-4 font-medium transition-all hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="place-order-button"
              >
                {submitting ? 'Opening WhatsApp...' : 'Order on WhatsApp'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl p-8 border border-border shadow-sm sticky top-24">
              <h2 className="text-2xl font-heading font-semibold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cart.map((item) => {
                  const product = products[item.product_id];
                  if (!product) return null;
                  return (
                    <div key={item.product_id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {product.name} x {item.quantity}
                      </span>
                      <span>₹{(product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-4 mb-6 pt-4 border-t border-border">
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
                  <span className="text-primary" data-testid="checkout-total">₹{calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;