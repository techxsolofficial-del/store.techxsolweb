import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, PhoneCall, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Logo } from './Logo';

export const Header: React.FC = () => {
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      {/* Top Value Proposition Bar */}
      <div className="bg-emerald-900 text-emerald-100 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-medium">
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              Cash on Delivery Across Pakistan (2-4 Days)
            </span>
            <span className="hidden md:inline text-emerald-400">|</span>
            <span className="hidden md:flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Pay Only After Inspecting Parcel Seal
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://wa.me/923001234567"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-emerald-200 hover:text-white transition-colors"
            >
              <PhoneCall className="w-3 h-3 text-emerald-400" />
              <span>WhatsApp: 0300-1234567</span>
            </a>
            <Link to="/track" className="hover:text-white underline text-emerald-200">
              Track Order
            </Link>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link to="/" className="flex items-center">
              <Logo size="md" />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            <Link to="/" className="hover:text-emerald-600 transition-colors">
              Home
            </Link>
            <Link to="/shop" className="hover:text-emerald-600 transition-colors">
              All Products
            </Link>
            <Link to="/shop?category=smart-gadgets" className="hover:text-emerald-600 transition-colors">
              Smart Gadgets
            </Link>
            <Link to="/shop?category=home-kitchen" className="hover:text-emerald-600 transition-colors">
              Home & Kitchen
            </Link>
            <Link to="/shop?category=personal-care" className="hover:text-emerald-600 transition-colors">
              Personal Care
            </Link>
          </nav>

          {/* Search & Cart */}
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="hidden sm:flex relative items-center">
              <input
                type="text"
                placeholder="Search products in Pakistan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 lg:w-64 pl-9 pr-3 py-1.5 text-sm rounded-full border border-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
            </form>

            <Link
              to="/cart"
              className="relative p-2 text-gray-700 hover:text-emerald-600 transition-colors flex items-center"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-5 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center mb-3">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-emerald-500"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
          </form>
          <div className="flex flex-col space-y-2 text-sm font-medium text-gray-800">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-gray-50"
            >
              Home
            </Link>
            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-gray-50"
            >
              All Products
            </Link>
            <Link
              to="/shop?category=smart-gadgets"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-gray-50"
            >
              Smart Gadgets & Audio
            </Link>
            <Link
              to="/shop?category=home-kitchen"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-gray-50"
            >
              Home & Kitchen Gadgets
            </Link>
            <Link
              to="/shop?category=personal-care"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-gray-50"
            >
              Personal Care & Grooming
            </Link>
            <Link
              to="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-lg text-emerald-700 bg-emerald-50 font-semibold"
            >
              Track My Order
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

