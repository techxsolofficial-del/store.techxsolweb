import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Order, formatPkr, ORDER_STATUS_LABELS, ORDER_STATUSES, PAKISTAN_CITIES } from '@dropship/shared';
import { fetchOrders, fetchAdminProducts } from '../services/api';
import {
  Search,
  Filter,
  Plus,
  ShoppingBag,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  X,
} from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const statusFilter = searchParams.get('status') || '';
  const channelFilter = searchParams.get('channel') || '';
  const searchQuery = searchParams.get('search') || '';

  // Manual WhatsApp Order Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [productsList, setProductsList] = useState<any[]>([]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetchOrders({
        status: statusFilter || undefined,
        channel: channelFilter || undefined,
        search: searchQuery || undefined,
      });
      setOrders(res.data);
      setTotal(res.pagination.total);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter, channelFilter, searchQuery]);

  const handleStatusFilterChange = (status: string) => {
    const next = new URLSearchParams(searchParams);
    if (status) next.set('status', status);
    else next.delete('status');
    setSearchParams(next);
  };

  const handleChannelFilterChange = (channel: string) => {
    const next = new URLSearchParams(searchParams);
    if (channel) next.set('channel', channel);
    else next.delete('channel');
    setSearchParams(next);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Orders Management</h1>
          <p className="text-xs text-gray-500 mt-1">
            Track and process orders across Website and WhatsApp channels
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/orders/new-whatsapp"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            + Manual WhatsApp Order
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search reference, customer name, phone..."
              value={searchQuery}
              onChange={(e) => {
                const next = new URLSearchParams(searchParams);
                if (e.target.value) next.set('search', e.target.value);
                else next.delete('search');
                setSearchParams(next);
              }}
              className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-emerald-500"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 pointer-events-none" />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-emerald-500 bg-white"
            >
              <option value="">Filter by Status: All Statuses</option>
              {ORDER_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {ORDER_STATUS_LABELS[st]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={channelFilter}
              onChange={(e) => handleChannelFilterChange(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-emerald-500 bg-white"
            >
              <option value="">Filter by Channel: All Channels</option>
              <option value="website">Website Checkout</option>
              <option value="whatsapp">WhatsApp Business</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-400 animate-pulse">
            Loading orders pipeline...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="font-bold text-gray-700 text-sm">No orders found</h3>
            <p className="text-xs text-gray-400">Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 uppercase font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Payable (COD)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Est. Profit</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-950">
                      <Link to={`/orders/${o.id}`} className="hover:underline">
                        {o.orderReference}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{o.customer?.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{o.customer?.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{o.customer?.city}</td>
                    <td className="py-3 px-4 capitalize">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          o.sourceChannel === 'whatsapp'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {o.sourceChannel}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">
                      {formatPkr(o.totalPayablePkr)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-800">
                        {ORDER_STATUS_LABELS[o.orderStatus]}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-700">
                      {formatPkr(o.actualProfitPkr > 0 ? o.actualProfitPkr : o.estimatedProfitPkr)}
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-[11px]">
                      {new Date(o.createdAt).toLocaleDateString('en-PK')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/orders/${o.id}`}
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
        )}
      </div>
    </div>
  );
};

