import React, { useState } from 'react';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { Logo } from './Logo';
import { X, User, Phone, MapPin, Truck, CheckCircle2, ArrowRight } from 'lucide-react';
import { PAKISTAN_CITIES, PAKISTAN_PHONE_REGEX } from '@dropship/shared';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalOptions, closeAuthModal, login } = useCustomerAuth();

  const [activeTab, setActiveTab] = useState<'signin' | 'guest'>('guest');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Lahore');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  if (!isAuthModalOpen) return null;

  const isWelcome = authModalOptions.mode === 'welcome';

  const handleGuestContinue = () => {
    closeAuthModal(true);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    const cleanPhone = phone.replace(/\s+/g, '').replace(/-/g, '');
    if (!PAKISTAN_PHONE_REGEX.test(cleanPhone)) {
      setError('Please enter a valid Pakistani mobile number (e.g. 03001234567).');
      return;
    }

    login({
      name: name.trim(),
      phone: cleanPhone,
      city,
      deliveryAddress: address.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="bg-emerald-950 text-white p-5 pb-6 relative">
          <button
            onClick={() => closeAuthModal(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors"
            aria-label="Close popup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center space-y-2">
            <Logo size="md" variant="light" />
            <h3 className="text-lg font-bold text-white tracking-tight pt-1">
              {authModalOptions.title || (isWelcome ? 'Welcome to ApnaBuy! 🛍️' : 'Sign In or Continue as Guest')}
            </h3>
            <p className="text-xs text-emerald-200/90 max-w-xs">
              {authModalOptions.description ||
                (isWelcome
                  ? 'Sign in to save your address & track orders, or browse freely as a guest.'
                  : 'Would you like to sign in to save your details, or proceed without logging in?')}
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5">
          {/* Quick Tab Selector */}
          <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-2xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('guest')}
              className={`py-2 px-3 rounded-xl transition-all ${
                activeTab === 'guest'
                  ? 'bg-white text-emerald-700 shadow-sm font-bold'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Continue as Guest
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('signin')}
              className={`py-2 px-3 rounded-xl transition-all ${
                activeTab === 'signin'
                  ? 'bg-white text-emerald-700 shadow-sm font-bold'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Sign In / Account
            </button>
          </div>

          {activeTab === 'guest' ? (
            /* GUEST MODE */
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Truck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-gray-900">
                  No Login Required for Shopping!
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
                  Aap bina login kiye direct Cash on Delivery par order kar sakte hain. Koi password yaad rakhne ki zaroorat nahi.
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleGuestContinue}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Continue as Guest</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('signin')}
                  className="w-full py-2.5 text-xs text-gray-500 hover:text-emerald-700 font-semibold transition-colors"
                >
                  Or sign in to save delivery address &rarr;
                </button>
              </div>
            </div>
          ) : (
            /* SIGN IN / CREATE PROFILE FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              {error && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Full Name</label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Muhammad Ali"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                  <User className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Mobile Number (WhatsApp/COD)</label>
                <div className="relative flex items-center">
                  <input
                    type="tel"
                    required
                    placeholder="03001234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-2.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
                  >
                    {PAKISTAN_CITIES.slice(0, 20).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Address (Optional)</label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      placeholder="House / Street"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pl-8 pr-2 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                    <MapPin className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save & Continue</span>
              </button>

              <button
                type="button"
                onClick={handleGuestContinue}
                className="w-full text-center py-1 text-xs text-gray-500 hover:text-gray-800 transition-colors"
              >
                Skip and continue as Guest &rarr;
              </button>
            </form>
          )}

          {/* Value Badges */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-around text-[10px] text-gray-500 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              100% Cash on Delivery
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              7-Day Replacement
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              WhatsApp Support
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

