import React, { useEffect, useState } from 'react';
import { formatPkr } from '@dropship/shared';
import { fetchReports } from '../services/api';
import { BarChart3, TrendingUp, DollarSign, PieChart, Truck, ShieldAlert } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="p-8 text-center text-xs text-gray-400">Loading business reports...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Financial & Channel Analytics
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Detailed metrics on website vs WhatsApp conversion, courier settlements, and net margin
        </p>
      </div>

      {/* Financials Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
            Total COD Collected
          </span>
          <div className="text-2xl font-black text-gray-900">
            {formatPkr(data.financials?.totalCollectedPkr || 0)}
          </div>
          <p className="text-[11px] text-gray-400">Total gross funds received from couriers</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
            Estimated Gross Pipeline Profit
          </span>
          <div className="text-2xl font-black text-gray-900">
            {formatPkr(data.financials?.totalEstimatedProfitPkr || 0)}
          </div>
          <p className="text-[11px] text-gray-400">Expected margin from all active orders</p>
        </div>

        <div className="bg-emerald-900 text-white p-6 rounded-3xl shadow-md space-y-2">
          <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider block">
            Actual Net Settled Profit
          </span>
          <div className="text-2xl font-black text-emerald-400">
            {formatPkr(data.financials?.totalActualProfitPkr || 0)}
          </div>
          <p className="text-[11px] text-emerald-200/80">
            Net pocket profit after supplier and courier deductions
          </p>
        </div>
      </div>

      {/* Channel Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-600" />
            Orders by Channel
          </h2>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-xs text-blue-900 block">Website Checkout (COD)</span>
                <span className="text-[11px] text-blue-700">Self-serve customer website orders</span>
              </div>
              <span className="text-xl font-extrabold text-blue-950">
                {data.channelBreakdown?.website || 0}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-xs text-emerald-900 block">WhatsApp Click-to-Chat</span>
                <span className="text-[11px] text-emerald-700">Orders finalized via WhatsApp conversation</span>
              </div>
              <span className="text-xl font-extrabold text-emerald-950">
                {data.channelBreakdown?.whatsapp || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            Status Distribution
          </h2>

          <div className="space-y-2">
            {Object.entries(data.statusBreakdown || {}).map(([st, count]: any) => (
              <div key={st} className="flex justify-between items-center py-2 px-3 rounded-lg bg-gray-50 text-xs">
                <span className="capitalize font-medium text-gray-700">{st.replace(/_/g, ' ')}</span>
                <span className="font-bold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

