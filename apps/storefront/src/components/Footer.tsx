import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ShieldCheck, Truck, RefreshCw, MessageCircle } from 'lucide-react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Badges Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-10 border-b border-gray-800">
          <div className="flex items-center gap-4 bg-gray-800/50 p-4 rounded-xl border border-gray-800">
            <div className="w-12 h-12 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Nationwide COD</h4>
              <p className="text-xs text-gray-400">Cash on delivery to all Pakistani cities</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-gray-800/50 p-4 rounded-xl border border-gray-800">
            <div className="w-12 h-12 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Zero Risk Ordering</h4>
              <p className="text-xs text-gray-400">No advance payment required</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-gray-800/50 p-4 rounded-xl border border-gray-800">
            <div className="w-12 h-12 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">7-Day Replacement</h4>
              <p className="text-xs text-gray-400">Easy claim for damaged parcels</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-gray-800/50 p-4 rounded-xl border border-gray-800">
            <div className="w-12 h-12 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">WhatsApp Assistance</h4>
              <p className="text-xs text-gray-400">Quick replies from 10 AM to 10 PM</p>
            </div>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-10">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <Logo variant="light" size="md" />
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Curated everyday innovations, trending electronics, and smart household tools delivered direct to your doorstep across Pakistan with trusted Cash on Delivery.
            </p>
            <div className="pt-2">
              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">
              Categories
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/shop?category=smart-gadgets" className="hover:text-emerald-400 transition-colors">
                  Smart Gadgets & Audio
                </Link>
              </li>
              <li>
                <Link to="/shop?category=home-kitchen" className="hover:text-emerald-400 transition-colors">
                  Home & Kitchen Gadgets
                </Link>
              </li>
              <li>
                <Link to="/shop?category=personal-care" className="hover:text-emerald-400 transition-colors">
                  Personal Care & Grooming
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-emerald-400 transition-colors">
                  View Full Catalog
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service & Policies */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">
              Customer Support
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/track" className="hover:text-emerald-400 transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="hover:text-emerald-400 transition-colors">
                  Shipping & Delivery Policy
                </Link>
              </li>
              <li>
                <Link to="/return-policy" className="hover:text-emerald-400 transition-colors">
                  Return & Refund Guarantee
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-emerald-400 transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-emerald-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-emerald-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">
              Contact & Coverage
            </h4>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Operating Hub: Lahore & Karachi, Pakistan</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>0300 1234567 (10 AM - 10 PM)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>support@apnabuy.pk</span>
              </div>
              <div className="pt-2 text-xs text-gray-400">
                Courier Partners: Trax, Call Courier, TCS, Leopards
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-3">
          <p>© {new Date().getFullYear()} apnabuy. All rights reserved. Operating across Pakistan.</p>
          <div className="flex items-center gap-4 text-gray-400">
            <a
              href="/admin/"
              className="text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-1 font-medium"
            >
              <span>🔒 Staff Portal</span>
            </a>
            <div className="flex items-center gap-2">
              <span>Payment:</span>
              <span className="font-semibold text-white px-2 py-0.5 rounded bg-gray-800 border border-gray-700">
                COD
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

