import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Order, formatPkr, ORDER_STATUS_LABELS } from '@dropship/shared';
import { fetchOrders } from '../services/api';
import { RotateCcw, AlertTriangle, ChevronRight, DollarSign } from 'lucide-react';

export const ReturnsPage: React.FC = () => {
  const [returnOrders, setReturnOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReturns() {
      setLoading(true);
      try {
        const [failedRes, returnedRes] = await Promise.all([
          fetchOrders({ status: 'delivery_failed' }),
          fetchOrders({ status: 'returned' }),
        ]);
        setReturnOrders([...failedRes.data, ...returnedRes.data]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReturns();
  }, []);

  const totalReverseCost = returnOrders.reduce((sum, o) => {
    const courierLoss = (o.fulfilments || []).reduce((fSum, f) => fSum + (f.courierChargePkr || 0) + (f.returnChargePkr || 0), 0);
    return sum + courierLoss;
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Returns & Failed Deliveries Management
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Track refused parcels, courier return shipping deductions, and customer replacement claims
        </p>
      </div>

      {/* Financial impact card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-red-950 text-white p-5 rounded-2xl border border-red-900 space-y-2">
          <span className="text-xs font-bold text-red-300 uppercase tracking-wider block">
            Reverse Logistics Shipping Loss
          </span>
          <div className="text-2xl font-black text-red-400">{formatPkr(totalReverseCost)}</div>
          <p className="text-[11px] text-red-200/80">Courier fees incurred on undelivered parcels</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            Undelivered Parcels
          </span>
          <div className="text-2xl font-black text-gray-900">{returnOrders.length}</div>
          <p className="text-[11px] text-gray-400">Parcels returned or delivery failed</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-400">Loading returns ledger...</div>
        ) : returnOrders.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <RotateCcw className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-gray-800 text-sm">No return losses recorded!</h3>
            <p className="text-xs text-gray-400">
              Orders marked as 'delivery_failed' or 'returned' will automatically display here for financial reconciliation.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Customer & City</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Courier & Tracking</th>
                <th className="py-3 px-4">Courier Fee Paid</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {returnOrders.map((o) => {
                const ful = o.fulfilments?.[0];
                return (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-950">
                      <Link to={`/orders/${o.id}`} className="hover:underline">
                        {o.orderReference}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <div>{o.customer?.name}</div>
                      <div className="text-[10px] text-gray-400">{o.customer?.city}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                        {ORDER_STATUS_LABELS[o.orderStatus]}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div>{ful?.courierName || 'Courier'}</div>
                      <div className="font-mono text-[10px] text-gray-500">{ful?.trackingNumber || '-'}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-red-600">
                      {formatPkr((ful?.courierChargePkr || 0) + (ful?.returnChargePkr || 0))}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/orders/${o.id}`}
                        className="px-3 py-1 rounded-lg bg-gray-800 text-white text-[11px] font-bold"
                      >
                        Reconcile
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

