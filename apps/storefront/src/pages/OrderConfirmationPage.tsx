import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { formatPkr } from '@dropship/shared';
import { useStoreSettings } from '../context/StoreSettingsContext';
import {
  CheckCircle2,
  PackageCheck,
  PhoneCall,
  Truck,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const OrderConfirmationPage: React.FC = () => {
  const location = useLocation();
  const { whatsappNumber } = useStoreSettings();
  const order = location.state?.order;

  if (!order) {
    return <Navigate to="/shop" replace />;
  }

  const whatsappInquiryUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Assalam-o-Alaikum! I have placed an order with Reference: *${order.orderReference}*. Please confirm status.`
  )}`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Success Badge & Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Thank You! Your COD Order is Confirmed
        </h1>
        <p className="text-sm text-gray-600 max-w-lg mx-auto">
          We have successfully received your order. Our customer verification officer will contact your phone number before dispatch.
        </p>
      </div>

      {/* Main Order Reference Card */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
          <div>
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
              Order Reference Number
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-950 font-mono">
              {order.orderReference}
            </span>
          </div>

          <Link
            to={`/track?ref=${encodeURIComponent(order.orderReference)}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-emerald-700 font-bold text-xs border border-emerald-300 shadow-xs hover:bg-emerald-50 transition-colors"
          >
            Track Real-time Status <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-gray-600 pt-2">
          <div className="space-y-1">
            <span className="font-bold text-gray-900 block">Delivery Address:</span>
            <p className="text-gray-700">{order.customerName}</p>
            <p className="text-gray-700">{order.customerPhone}</p>
            <p className="text-gray-700">{order.deliveryAddress}, {order.city}</p>
          </div>

          <div className="space-y-2 bg-gray-50 p-4 rounded-2xl border border-gray-200">
            <div className="flex justify-between">
              <span>Items Subtotal:</span>
              <span className="font-semibold text-gray-900">{formatPkr(order.subtotalPkr)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charge:</span>
              <span className="font-semibold text-gray-900">
                {order.deliveryChargePkr === 0 ? 'FREE' : formatPkr(order.deliveryChargePkr)}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-bold text-emerald-800">
              <span>Total Payable (COD):</span>
              <span className="text-base font-extrabold">{formatPkr(order.totalPayablePkr)}</span>
            </div>
          </div>
        </div>

        {/* What Happens Next Steps */}
        <div className="space-y-4 pt-6 border-t border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-emerald-600" />
            What Happens Next?
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1 text-xs">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold inline-flex items-center justify-center text-[10px]">
                1
              </span>
              <div className="font-semibold text-gray-900">Phone Verification</div>
              <p className="text-gray-500 text-[11px]">
                Our representative will call {order.customerPhone} to verify your address.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1 text-xs">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold inline-flex items-center justify-center text-[10px]">
                2
              </span>
              <div className="font-semibold text-gray-900">Courier Dispatch</div>
              <p className="text-gray-500 text-[11px]">
                Parcel is packed by our partner supplier and dispatched via Trax/Leopards.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1 text-xs">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold inline-flex items-center justify-center text-[10px]">
                3
              </span>
              <div className="font-semibold text-gray-900">Cash on Delivery</div>
              <p className="text-gray-500 text-[11px]">
                Pay {formatPkr(order.totalPayablePkr)} cash to the rider upon delivery in 2-4 days.
              </p>
            </div>
          </div>
        </div>

        {/* WhatsApp & Support Button */}
        <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
          <a
            href={whatsappInquiryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Connect With Order Support on WhatsApp
          </a>

          <Link
            to="/shop"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold text-center transition-colors"
          >
            Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
};

