import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PublicOrderTrackingResult, formatPkr } from '@dropship/shared';
import { trackOrder } from '../services/api';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

export const OrderTrackingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [reference, setReference] = useState(searchParams.get('ref') || '');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<PublicOrderTrackingResult | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim() || !phone.trim()) {
      setError('Please provide both your Order Reference and registered Pakistani Mobile Number.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await trackOrder(reference.trim(), phone.trim());
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Could not locate order with the provided details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Track Your Order
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
          Enter your Order Reference number and the mobile phone number used during checkout to view delivery progress.
        </p>
      </div>

      {/* Verification & Query Form */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleTrack} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">
                Order Reference
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ORD-20261019-XXXX"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full text-sm font-mono px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">
                Registered Mobile Number
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. 0300 1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Verifying Order...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Track Order Status
              </>
            )}
          </button>
        </form>
      </div>

      {/* Tracking Result Card */}
      {result && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
          {/* Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <span className="text-xs text-gray-400 font-mono block">Order Reference: {result.orderReference}</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-extrabold text-gray-900">
                  Status: {result.orderStatusLabel}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  {result.paymentStatusLabel}
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-gray-500 block">Total Payable upon Delivery</span>
              <span className="text-xl font-black text-emerald-700">
                {formatPkr(result.totalPayablePkr)}
              </span>
            </div>
          </div>

          {/* Courier & Redacted Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl text-xs text-gray-600 border border-gray-200">
            <div>
              <span className="font-bold text-gray-900 block mb-1">Destination City:</span>
              <p>{result.city}, Pakistan</p>
              <p className="text-gray-400 mt-1">Masked Address: {result.maskedAddress}</p>
              <p className="text-gray-400">Masked Phone: {result.maskedPhone}</p>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-gray-900 block mb-1">Courier Logistics:</span>
              {result.courierName ? (
                <>
                  <p className="font-semibold text-emerald-800">Partner: {result.courierName}</p>
                  <p className="font-mono text-gray-700">Tracking CN: {result.trackingNumber || 'Awaiting CN'}</p>
                </>
              ) : (
                <p className="text-gray-500 italic">Courier assignment in progress. Awaiting supplier dispatch.</p>
              )}
            </div>
          </div>

          {/* Milestone Timeline */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              Delivery Timeline
            </h3>

            <div className="space-y-4 pl-3 border-l-2 border-emerald-200 ml-2">
              {result.timeline.map((step, idx) => (
                <div key={idx} className="relative pl-6">
                  <div className="w-3 h-3 rounded-full bg-emerald-600 absolute -left-[7px] top-1 ring-4 ring-white" />
                  <div className="text-xs font-bold text-gray-900">{step.label}</div>
                  <div className="text-[11px] text-gray-400">
                    {new Date(step.timestamp).toLocaleString('en-PK')}
                  </div>
                  {step.note && <div className="text-xs text-gray-600 mt-0.5">{step.note}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

