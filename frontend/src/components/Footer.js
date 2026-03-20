import React from 'react';
import { Link } from 'react-router-dom';
import { Flower2, Instagram, Facebook, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-24">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Flower2 className="w-6 h-6 text-primary" />
              <span className="text-xl font-heading font-bold">Bloom & Vibe</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Bringing joy through beautiful flowers, one bouquet at a time.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-4">Shop</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/products?category=bouquet" className="hover:text-primary transition-colors">
                  Bouquets
                </Link>
              </li>
              <li>
                <Link to="/products?category=single" className="hover:text-primary transition-colors">
                  Single Flowers
                </Link>
              </li>
              <li>
                <Link to="/products?occasion=love" className="hover:text-primary transition-colors">
                  Love & Romance
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Delivery Info
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Returns
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 Bloom & Vibe. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;