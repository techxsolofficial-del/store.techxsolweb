import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useStoreSettings } from '../context/StoreSettingsContext';
import { formatPkr, buildWhatsAppOrderLink } from '@dropship/shared';
import {
  Trash2,
  ArrowRight,
  ShoppingBag,
  MessageCircle,
  Truck,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, openAuthModal } = useCustomerAuth();
  const { whatsappNumber } = useStoreSettings();
  const {
    items,
    updateQuantity,
    removeFromCart,
    subtotalPkr,
    deliveryChargePkr,
    totalPayablePkr,
    isFreeDelivery,
    freeDeliveryThresholdPkr,
  } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          Looks like you haven't added any products to your cart yet. Explore our trending gadgets and kitchen tools!
        </p>
        <div className="pt-2">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-colors"
          >
            Start Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const whatsappCartLink = buildWhatsAppOrderLink({
    businessPhone: whatsappNumber || '923001234567',
    items: items.map((i) => ({
      name: i.product.name,
      variantName: i.variantName,
      quantity: i.quantity,
      unitPricePkr: i.unitPricePkr,
    })),
    subtotalPkr,
    deliveryChargePkr,
    totalPkr: totalPayablePkr,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
          </h1>
          <p className="text-xs text-gray-500 mt-1">Review your products before placing COD order</p>
        </div>
        <Link
          to="/shop"
          className="hidden sm:flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
        >
          <ChevronLeft className="w-4 h-4" /> Continue Shopping
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Free Shipping Alert Bar */}
          {!isFreeDelivery && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Add <strong>{formatPkr(freeDeliveryThresholdPkr - subtotalPkr)}</strong> more to your cart to qualify for <strong>FREE Nationwide Delivery</strong>!
              </span>
            </div>
          )}
          {isFreeDelivery && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                🎉 <strong>Awesome!</strong> Your order qualifies for <strong>FREE Delivery</strong> across Pakistan!
              </span>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 shadow-sm overflow-hidden">
            {items.map((item, idx) => {
              const imgUrl = item.product.images[0]?.url;
              return (
                <div key={`${item.product.id}-${item.variantId || idx}`} className="p-4 sm:p-6 flex gap-4 items-center">
                  {/* Thumbnail */}
                  <Link
                    to={`/product/${item.product.slug}`}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200"
                  >
                    <img src={imgUrl} alt={item.product.name} className="w-full h-full object-cover" />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <Link
                      to={`/product/${item.product.slug}`}
                      className="font-semibold text-sm sm:text-base text-gray-900 hover:text-emerald-600 truncate block"
                    >
                      {item.product.name}
                    </Link>
                    {item.variantName && (
                      <span className="inline-block text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {item.variantName}
                      </span>
                    )}
                    <div className="text-sm font-bold text-gray-900">
                      {formatPkr(item.unitPricePkr)}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden shadow-xs">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.variantId, item.quantity - 1)}
                      className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-gray-900 select-none">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.variantId, item.quantity + 1)}
                      className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 font-bold text-xs"
                    >
                      +
                    </button>
                  </div>

                  {/* Line Total & Remove */}
                  <div className="text-right space-y-1">
                    <div className="text-sm font-bold text-gray-900">
                      {formatPkr(item.unitPricePkr * item.quantity)}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id, item.variantId)}
                      className="text-xs text-red-500 hover:text-red-700 p-1"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">{formatPkr(subtotalPkr)}</span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span>Estimated Delivery</span>
              <span className="font-semibold text-gray-900">
                {deliveryChargePkr === 0 ? (
                  <span className="text-emerald-600 font-bold">FREE</span>
                ) : (
                  formatPkr(deliveryChargePkr)
                )}
              </span>
            </div>

            <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline">
              <span className="text-base font-bold text-gray-900">Total Payable (COD)</span>
              <span className="text-2xl font-extrabold text-emerald-700">
                {formatPkr(totalPayablePkr)}
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => {
                if (!isLoggedIn) {
                  openAuthModal({
                    mode: 'action',
                    title: 'Proceed to Checkout 📦',
                    description: 'Sign in to save your delivery address, or continue to checkout as a guest.',
                    onContinue: () => navigate('/checkout'),
                  });
                } else {
                  navigate('/checkout');
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors"
            >
              <span>Proceed to COD Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href={whatsappCartLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs border border-emerald-300 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              Order Entire Cart via WhatsApp
            </a>
          </div>

          <div className="pt-4 border-t border-gray-100 text-[11px] text-gray-500 space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Zero online payment required. Pay upon delivery.</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Standard delivery 2-4 working days across Pakistan.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

