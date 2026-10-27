import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import {
  PAKISTAN_CITIES,
  PAKISTAN_PHONE_REGEX,
  formatPkr,
  CreateOrderInput,
} from '@dropship/shared';
import { submitOrder } from '../services/api';
import {
  Truck,
  ShieldCheck,
  Lock,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { items, subtotalPkr, deliveryChargePkr, totalPayablePkr, clearCart } = useCart();
  const { customer, isLoggedIn, login: saveCustomerAuth, openAuthModal } = useCustomerAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(customer?.name || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [city, setCity] = useState(customer?.city || 'Lahore');
  const [deliveryAddress, setDeliveryAddress] = useState(customer?.deliveryAddress || '');
  const [deliveryInstructions, setDeliveryInstructions] = useState(customer?.deliveryInstructions || '');
  const [termsAgreed, setTermsAgreed] = useState(true);

  useEffect(() => {
    if (customer) {
      if (!name) setName(customer.name);
      if (!phone) setPhone(customer.phone);
      if (customer.city) setCity(customer.city);
      if (customer.deliveryAddress && !deliveryAddress) setDeliveryAddress(customer.deliveryAddress);
    }
  }, [customer]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Your cart is empty</h2>
        <p className="text-sm text-gray-500">Please add items to your cart before proceeding to checkout.</p>
        <Link to="/shop" className="inline-block px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold">
          Return to Shop
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Client-side phone format pre-validation
    const cleanPhone = phone.replace(/\s+/g, '').replace(/-/g, '');
    if (!PAKISTAN_PHONE_REGEX.test(cleanPhone)) {
      setErrorMessage('Please enter a valid Pakistani mobile number (e.g. 03001234567 or +923001234567).');
      return;
    }

    if (!termsAgreed) {
      setErrorMessage('Please confirm your consent to the terms and privacy policy.');
      return;
    }

    setSubmitting(true);

    try {
      // Generate client idempotency key to prevent double submissions
      const idempotencyKey = `idem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      const payload: CreateOrderInput = {
        customer: {
          name,
          phone,
          alternatePhone: alternatePhone || undefined,
          city,
          deliveryAddress,
          deliveryInstructions: deliveryInstructions || undefined,
        },
        items: items.map((i) => ({
          productId: i.product.id,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
        sourceChannel: 'website',
      };

      const result = await submitOrder(payload, idempotencyKey);
      clearCart();

      // Automatically remember customer info for fast tracking and future orders
      saveCustomerAuth({
        name,
        phone: cleanPhone,
        city,
        deliveryAddress,
        deliveryInstructions: deliveryInstructions || undefined,
      });

      // Navigate to order confirmation
      navigate('/order-confirmed', {
        state: { order: result.data },
        replace: true,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not place order. Please review your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb / Back */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Checkout (Cash on Delivery)
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Complete your delivery information. Pay in cash when the courier arrives.
          </p>
        </div>
        <Link to="/cart" className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700">
          <ChevronLeft className="w-4 h-4" /> Back to Cart
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Checkout Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-xs">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{errorMessage}</div>
              </div>
            )}

            {/* Account Status / Fast Fill Banner */}
            {isLoggedIn && customer ? (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Ordering as <strong>{customer.name}</strong> ({customer.phone})</span>
                </div>
                <span className="text-[11px] text-emerald-700 font-medium hidden sm:inline">Details auto-filled</span>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between text-xs text-gray-600">
                <span>Ordering as <strong>Guest</strong> (No login required)</span>
                <button
                  type="button"
                  onClick={() => openAuthModal({ mode: 'action' })}
                  className="text-emerald-700 font-bold hover:underline"
                >
                  Sign In for 1-Click Fill &rarr;
                </button>
              </div>
            )}

            {/* Customer Information */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-bold">
                  1
                </span>
                Customer & Contact Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Muhammad Ali"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">
                    Pakistani Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0300 1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                  <p className="text-[11px] text-gray-400">Our representative will call this number to verify dispatch</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">
                  Alternate Phone (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 0321 9876543 (Secondary or Family member number)"
                  value={alternatePhone}
                  onChange={(e) => setAlternatePhone(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Delivery Address */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-bold">
                  2
                </span>
                Delivery Location in Pakistan
              </h2>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">
                  City <span className="text-red-500">*</span>
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-emerald-500 bg-white"
                >
                  {PAKISTAN_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">
                  Complete Street Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="House / Apartment number, Street name, Sector / Block, Landmark..."
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">
                  Special Delivery Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Deliver during office hours, Call before arrival..."
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-bold">
                  3
                </span>
                Payment Method
              </h2>

              <div className="p-4 rounded-2xl bg-emerald-50/80 border-2 border-emerald-600 flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-bold text-emerald-950">
                    Cash on Delivery (COD)
                  </div>
                  <p className="text-xs text-emerald-900/80 leading-relaxed">
                    Pay the exact total amount in cash to the courier delivery rider upon receiving your parcel. No advance card payment or deposit needed.
                  </p>
                </div>
              </div>
            </div>

            {/* Consent Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>
                  I agree to the{' '}
                  <Link to="/terms" className="text-emerald-600 underline">
                    Terms & Conditions
                  </Link>{' '}
                  and understand our team will call my phone number to verify this order prior to dispatch.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-950/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Placing Cash on Delivery Order...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Place Cash on Delivery Order ({formatPkr(totalPayablePkr)})
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Order Review Sidebar */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>

          {/* Items mini list */}
          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto pr-1">
            {items.map((i, idx) => (
              <div key={idx} className="py-3 flex items-center gap-3">
                <img
                  src={i.product.images[0]?.url}
                  alt=""
                  className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0"
                />
                <div className="flex-1 min-w-0 text-xs">
                  <div className="font-semibold text-gray-900 truncate">{i.product.name}</div>
                  <div className="text-gray-500">
                    Qty: {i.quantity} {i.variantName ? `(${i.variantName})` : ''}
                  </div>
                </div>
                <div className="text-xs font-bold text-gray-900">
                  {formatPkr(i.unitPricePkr * i.quantity)}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing calculations */}
          <div className="space-y-2.5 text-xs pt-4 border-t border-gray-200">
            <div className="flex justify-between text-gray-600">
              <span>Items Subtotal</span>
              <span className="font-semibold text-gray-900">{formatPkr(subtotalPkr)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Nationwide Delivery</span>
              <span className="font-semibold text-gray-900">
                {deliveryChargePkr === 0 ? (
                  <span className="text-emerald-600 font-bold">FREE</span>
                ) : (
                  formatPkr(deliveryChargePkr)
                )}
              </span>
            </div>
            <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline text-sm">
              <span className="font-bold text-gray-900">Total Payable (COD)</span>
              <span className="text-xl font-extrabold text-emerald-700">
                {formatPkr(totalPayablePkr)}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-2 text-[11px] text-gray-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Inspection allowed before payment</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Dispatched via Trax / Leopards</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

