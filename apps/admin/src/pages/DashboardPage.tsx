import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardMetrics, formatPkr, ORDER_STATUS_LABELS } from '@dropship/shared';
import { fetchDashboardMetrics } from '../services/api';
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  RotateCcw,
  Banknote,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !metrics) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-28 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Executive Performance Overview
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time Pakistan COD order pipeline, supplier dispatches, and profit settlements
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-gray-700 text-xs font-semibold border border-gray-300 shadow-xs hover:bg-gray-50 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Pipeline
        </button>
      </div>

      {/* Critical Alert Bar: Pending Confirmation */}
      {metrics.pendingConfirmation > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-200/80 text-amber-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs">
                {metrics.pendingConfirmation} New {metrics.pendingConfirmation === 1 ? 'Order' : 'Orders'} Awaiting Phone Confirmation!
              </h3>
              <p className="text-[11px] text-amber-800/80">
                Contact customers to confirm delivery address before dispatching to dropship supplier.
              </p>
            </div>
          </div>
          <Link
            to="/orders?status=pending_confirmation"
            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 text-center"
          >
            Review Orders &rarr;
          </Link>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">{metrics.totalOrders}</div>
          <div className="text-[11px] text-gray-400">Lifetime orders placed</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Confirmed & Supplier</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">{metrics.confirmedOrders}</div>
          <div className="text-[11px] text-purple-600 font-medium">Ready for packaging</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">In Transit (Courier)</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">{metrics.dispatchedOrders}</div>
          <div className="text-[11px] text-indigo-600 font-medium">With Trax / Leopards</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Delivered</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700">{metrics.deliveredOrders}</div>
          <div className="text-[11px] text-emerald-600 font-medium">Successfully delivered</div>
        </div>
      </div>

      {/* Financial Health & Settlements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-emerald-900 text-white p-6 rounded-3xl shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              Actual Net Profit (Settled)
            </span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {formatPkr(metrics.totalActualProfitPkr)}
          </div>
          <p className="text-xs text-emerald-200/80">
            Reconciled cash received minus supplier wholesale cost and courier fees.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Estimated Pipeline Profit
            </span>
            <Banknote className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-3xl font-extrabold text-gray-900">
            {formatPkr(metrics.totalEstimatedProfitPkr)}
          </div>
          <p className="text-xs text-gray-500">
            Expected gross profit from current active pipeline upon complete delivery.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              COD Awaiting Settlement
            </span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-800">
            {formatPkr(metrics.unsettledCodPkr)}
          </div>
          <p className="text-xs text-gray-500">
            Cash collected by couriers or in transit awaiting bank remittance into store account.
          </p>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Recent Orders</h2>
            <p className="text-xs text-gray-400">Latest submissions across website and WhatsApp</p>
          </div>
          <Link
            to="/orders"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            All Orders <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Payable</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {metrics.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-emerald-950">
                    <Link to={`/orders/${order.id}`} className="hover:underline">
                      {order.orderReference}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-gray-900">
                    <div>{order.customer?.name}</div>
                    <div className="text-[10px] text-gray-400">{order.customer?.phone}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{order.customer?.city}</td>
                  <td className="py-3 px-4 capitalize">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        order.sourceChannel === 'whatsapp'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {order.sourceChannel}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-gray-900">
                    {formatPkr(order.totalPayablePkr)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-800">
                      {ORDER_STATUS_LABELS[order.orderStatus]}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/orders/${order.id}`}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold inline-block"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

