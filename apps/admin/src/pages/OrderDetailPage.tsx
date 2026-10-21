import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Order,
  Supplier,
  formatPkr,
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_LABELS,
  UpdateOrderStatusInput,
} from '@dropship/shared';
import {
  fetchOrderById,
  updateOrderStatus,
  addOrderNote,
  addOrderFulfilment,
  updateOrderFulfilment,
  addFinancialTransaction,
  fetchAdminSuppliers,
} from '../services/api';
import {
  ChevronLeft,
  Truck,
  Phone,
  MessageCircle,
  Clock,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Plus,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  // Status modal
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusReason, setStatusReason] = useState<string>('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fulfilment modal
  const [supplierId, setSupplierId] = useState<string>('');
  const [courierName, setCourierName] = useState('Trax Logistics');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierChargePkr, setCourierChargePkr] = useState(250);
  const [assigningFulfilment, setAssigningFulfilment] = useState(false);

  // Financial Transaction
  const [txnType, setTxnType] = useState<'cod_collection' | 'supplier_payout' | 'courier_fee'>('cod_collection');
  const [txnAmount, setTxnAmount] = useState<number>(0);
  const [txnRef, setTxnRef] = useState<string>('');
  const [recordingTxn, setRecordingTxn] = useState(false);

  // Notes
  const [noteText, setNoteText] = useState('');

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [orderData, suppliersData] = await Promise.all([
        fetchOrderById(id),
        fetchAdminSuppliers(),
      ]);
      setOrder(orderData);
      setNewStatus(orderData.orderStatus);
      setSuppliers(suppliersData);
      if (suppliersData.length > 0) setSupplierId(suppliersData[0].id);
      setTxnAmount(orderData.totalPayablePkr);
    } catch (err) {
      console.error('Failed to load order', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading || !order) {
    return <div className="p-8 text-center text-xs text-gray-400">Loading order details...</div>;
  }

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setUpdatingStatus(true);
    try {
      const updated = await updateOrderStatus(id, {
        status: newStatus as any,
        reason: statusReason,
      });
      setOrder(updated);
      setStatusReason('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssignFulfilment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setAssigningFulfilment(true);
    try {
      const updated = await addOrderFulfilment(id, {
        supplierId,
        courierName,
        trackingNumber: trackingNumber || undefined,
        courierChargePkr,
      });
      setOrder(updated);
      setTrackingNumber('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAssigningFulfilment(false);
    }
  };

  const handleRecordTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || txnAmount <= 0) return;
    setRecordingTxn(true);
    try {
      const updated = await addFinancialTransaction(id, {
        transactionType: txnType,
        amountPkr: txnAmount,
        referenceNumber: txnRef || undefined,
        status: 'completed',
      });
      setOrder(updated);
      setTxnRef('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRecordingTxn(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !noteText.trim()) return;
    try {
      const updated = await addOrderNote(id, noteText.trim());
      setOrder(updated);
      setNoteText('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const whatsappCustomerLink = `https://wa.me/${order.customer?.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
    `Assalam-o-Alaikum ${order.customer?.name}! This is apnabuy customer support regarding your order reference: ${order.orderReference}. We are calling to confirm your delivery address: ${order.customer?.deliveryAddress}, ${order.customer?.city}.`
  )}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <Link
            to="/orders"
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 mb-2"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Orders
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight font-mono">
              {order.orderReference}
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900">
              {ORDER_STATUS_LABELS[order.orderStatus]}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
              {PAYMENT_STATUS_LABELS[order.paymentStatus]}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Placed via <strong className="capitalize">{order.sourceChannel}</strong> on{' '}
            {new Date(order.createdAt).toLocaleString('en-PK')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={whatsappCustomerLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp Customer
          </a>
          <a
            href={`tel:${order.customer?.phone}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs shadow-sm"
          >
            <Phone className="w-4 h-4" />
            Call: {order.customer?.phone}
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Customer & Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Customer & Delivery Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-gray-400">Recipient Name:</span>
                <p className="font-bold text-gray-900 text-sm">{order.customer?.name}</p>
                <span className="text-gray-400">Primary Mobile:</span>
                <p className="font-mono font-bold text-emerald-700">{order.customer?.phone}</p>
                {order.customer?.alternatePhone && (
                  <>
                    <span className="text-gray-400">Alternate Mobile:</span>
                    <p className="font-mono text-gray-700">{order.customer.alternatePhone}</p>
                  </>
                )}
              </div>
              <div className="space-y-1">
                <span className="text-gray-400">Destination City:</span>
                <p className="font-bold text-gray-900 text-sm">{order.customer?.city}</p>
                <span className="text-gray-400">Complete Address:</span>
                <p className="text-gray-800">{order.customer?.deliveryAddress}</p>
                {order.customer?.deliveryInstructions && (
                  <p className="text-amber-800 italic bg-amber-50 p-2 rounded-lg mt-1 border border-amber-200">
                    Note: {order.customer.deliveryInstructions}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-100 font-bold text-sm text-gray-900">
              Ordered Items Snapshot
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Selling Price</th>
                  <th className="py-3 px-4">Wholesale Cost</th>
                  <th className="py-3 px-4">Qty</th>
                  <th className="py-3 px-4 text-right">Total (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{item.productNameSnapshot}</div>
                      {item.variantSnapshot && (
                        <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                          {item.variantSnapshot.name}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-900">{formatPkr(item.unitPricePkr)}</td>
                    <td className="py-3 px-4 text-gray-500">{formatPkr(item.supplierCostPkr)}</td>
                    <td className="py-3 px-4 font-bold">{item.quantity}</td>
                    <td className="py-3 px-4 text-right font-bold text-gray-900">
                      {formatPkr(item.totalPricePkr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Calculations Breakdown */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal:</span>
                <span className="font-bold text-gray-900">{formatPkr(order.subtotalPkr)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charge:</span>
                <span className="font-bold text-gray-900">
                  {order.deliveryChargePkr === 0 ? 'FREE' : formatPkr(order.deliveryChargePkr)}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-bold text-emerald-900">
                <span>Total Payable by Customer (COD):</span>
                <span className="text-base font-black">{formatPkr(order.totalPayablePkr)}</span>
              </div>
            </div>
          </div>

          {/* Dropshipping Fulfilment Assignment Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600" />
              Supplier & Courier Fulfilment Hub
            </h2>

            {order.fulfilments && order.fulfilments.length > 0 ? (
              <div className="space-y-3">
                {order.fulfilments.map((f) => (
                  <div key={f.id} className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-2">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-gray-900">Supplier: {f.supplierName}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 capitalize">
                        {f.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-gray-600">
                      <div>
                        <span>Courier: </span>
                        <strong>{f.courierName || 'Not Assigned'}</strong>
                      </div>
                      <div>
                        <span>Tracking CN: </span>
                        <strong>{f.trackingNumber || 'Pending'}</strong>
                      </div>
                      <div>
                        <span>Courier Fee: </span>
                        <strong>{formatPkr(f.courierChargePkr)}</strong>
                      </div>
                      <div>
                        <span>Return Loss: </span>
                        <strong className="text-red-600">{formatPkr(f.returnChargePkr)}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">No supplier or courier assigned yet.</p>
            )}

            {/* Assign Fulfilment Form */}
            <form onSubmit={handleAssignFulfilment} className="pt-3 border-t border-gray-100 space-y-3">
              <div className="font-semibold text-xs text-gray-800">Assign / Forward to Dropship Supplier:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-gray-500">Select Supplier</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.businessName} ({s.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-500">Courier Service</label>
                  <select
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white"
                  >
                    <option value="Trax Logistics">Trax Logistics</option>
                    <option value="Leopards Courier">Leopards Courier</option>
                    <option value="Call Courier">Call Courier</option>
                    <option value="TCS Express">TCS Express</option>
                    <option value="PostEx">PostEx</option>
                    <option value="M&P Express">M&P Express</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-500">Tracking Number / CN</label>
                  <input
                    type="text"
                    placeholder="e.g. TRX19283019PK"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-gray-300"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-500">Courier Cost (PKR)</label>
                  <input
                    type="number"
                    value={courierChargePkr}
                    onChange={(e) => setCourierChargePkr(parseInt(e.target.value, 10) || 0)}
                    className="w-full text-xs p-2 rounded-lg border border-gray-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={assigningFulfilment}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                {assigningFulfilment ? 'Saving Fulfilment...' : 'Save Fulfilment & Tracking'}
              </button>
            </form>
          </div>

          {/* Internal Notes */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Internal Notes</h2>
            {order.internalNotes && (
              <pre className="p-3 rounded-xl bg-gray-50 text-xs font-mono text-gray-700 whitespace-pre-wrap border border-gray-200">
                {order.internalNotes}
              </pre>
            )}
            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                placeholder="Add private note (e.g. called customer, requested delivery on Friday)..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="flex-1 text-xs p-2 rounded-lg border border-gray-300"
              />
              <button type="submit" className="px-4 py-2 bg-gray-800 text-white rounded-lg text-xs font-bold">
                Add Note
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Status Transitions & Financial Reconciliation */}
        <div className="space-y-6">
          {/* Order Status Transition Widget */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Update Order Status
            </h2>
            <form onSubmit={handleStatusUpdate} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-500">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 bg-white"
                >
                  {ORDER_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {ORDER_STATUS_LABELS[st]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-500">Transition Notes / Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Customer verified address via phone call"
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-gray-300"
                />
              </div>

              <button
                type="submit"
                disabled={updatingStatus}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors"
              >
                {updatingStatus ? 'Updating...' : 'Confirm Status Change'}
              </button>
            </form>
          </div>

          {/* Actual Profit & COD Settlement Engine */}
          <div className="bg-emerald-950 text-white rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Order Profitability
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs border-y border-emerald-900 py-3">
              <div>
                <span className="text-emerald-300/80 block">Estimated Profit:</span>
                <span className="text-lg font-bold text-white">{formatPkr(order.estimatedProfitPkr)}</span>
              </div>
              <div>
                <span className="text-emerald-300/80 block">Actual Net Profit:</span>
                <span className="text-lg font-black text-emerald-400">
                  {formatPkr(order.actualProfitPkr)}
                </span>
              </div>
            </div>

            {/* Record Transaction Form */}
            <form onSubmit={handleRecordTransaction} className="space-y-3 pt-2">
              <span className="text-xs font-bold text-emerald-200 block">Record Settlement Event:</span>
              <select
                value={txnType}
                onChange={(e) => setTxnType(e.target.value as any)}
                className="w-full text-xs p-2 rounded-lg bg-emerald-900 border border-emerald-800 text-white"
              >
                <option value="cod_collection">COD Cash Remitted by Courier</option>
                <option value="supplier_payout">Supplier Wholesale Payout</option>
                <option value="courier_fee">Courier Shipping Fee Deducted</option>
                <option value="return_loss">Return / Failed Delivery Loss</option>
              </select>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Amount PKR"
                  value={txnAmount}
                  onChange={(e) => setTxnAmount(parseInt(e.target.value, 10) || 0)}
                  className="w-full text-xs p-2 rounded-lg bg-emerald-900 border border-emerald-800 text-white"
                />
                <input
                  type="text"
                  placeholder="Bank Ref / CN"
                  value={txnRef}
                  onChange={(e) => setTxnRef(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-emerald-900 border border-emerald-800 text-white"
                />
              </div>

              <button
                type="submit"
                disabled={recordingTxn}
                className="w-full py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs transition-colors"
              >
                {recordingTxn ? 'Recording...' : 'Record Financial Transaction'}
              </button>
            </form>
          </div>

          {/* Status Timeline History */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              Audit Status Timeline
            </h2>

            <div className="space-y-3 pl-2 border-l-2 border-emerald-200 text-xs">
              {(order.statusHistory || []).map((h) => (
                <div key={h.id} className="relative pl-4 space-y-0.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 absolute -left-[6px] top-1" />
                  <div className="font-bold text-gray-900">
                    {ORDER_STATUS_LABELS[h.newStatus] || h.newStatus}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {new Date(h.createdAt).toLocaleString('en-PK')} • by {h.actorName || 'System'}
                  </div>
                  {h.notes && <div className="text-gray-600 text-[11px]">{h.notes}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

