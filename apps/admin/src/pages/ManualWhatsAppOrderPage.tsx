import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Product, PAKISTAN_CITIES, formatPkr, CreateOrderInput } from '@dropship/shared';
import { fetchAdminProducts } from '../services/api';
import { ChevronLeft, MessageCircle, Plus, Trash2 } from 'lucide-react';

export const ManualWhatsAppOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [city, setCity] = useState('Lahore');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [selectedItems, setSelectedItems] = useState<Array<{ productId: string; variantId?: string; quantity: number }>>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAdminProducts({ limit: 100 } as any)
      .then((res) => setProducts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAddItem = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const defaultVariant = prod.variants?.[0]?.id;
    setSelectedItems((prev) => [...prev, { productId, variantId: defaultVariant, quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      alert('Please add at least one product.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateOrderInput = {
        customer: {
          name: customerName,
          phone: customerPhone,
          city,
          deliveryAddress: address,
          deliveryInstructions: notes || undefined,
        },
        items: selectedItems,
        sourceChannel: 'whatsapp',
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to create order');
      }

      alert(`WhatsApp Order Created Successfully! Reference: ${data.data.orderReference}`);
      navigate('/orders');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          to="/orders"
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 mb-2"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Orders
        </Link>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-emerald-600" />
          Create Manual WhatsApp Order
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Record an order requested by a customer via WhatsApp click-to-chat inquiry
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
        {/* Customer Info */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Customer Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Customer Name *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-gray-300 mt-1"
                placeholder="Muhammad Bilal"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700">WhatsApp Phone *</label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-gray-300 mt-1"
                placeholder="0300 1234567"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700">Destination City *</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-gray-300 mt-1 bg-white"
              >
                {PAKISTAN_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700">Complete Address *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-gray-300 mt-1"
                placeholder="House 12, Street 3, Block C..."
              />
            </div>
          </div>
        </div>

        {/* Product Selection */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Selected Products ({selectedItems.length})
            </h2>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAddItem(e.target.value);
                  e.target.value = '';
                }
              }}
              className="text-xs p-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-900 font-bold"
            >
              <option value="">+ Add Product to Order</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({formatPkr(p.basePricePkr)})
                </option>
              ))}
            </select>
          </div>

          {selectedItems.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No products added yet. Select from the dropdown above.</p>
          ) : (
            <div className="space-y-2">
              {selectedItems.map((item, idx) => {
                const prod = products.find((p) => p.id === item.productId);
                return (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs gap-3">
                    <span className="font-semibold text-gray-900 flex-1 truncate">{prod?.name}</span>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={item.quantity}
                      onChange={(e) => {
                        const q = parseInt(e.target.value, 10) || 1;
                        const copy = [...selectedItems];
                        copy[idx].quantity = q;
                        setSelectedItems(copy);
                      }}
                      className="w-16 p-1 border rounded text-center text-xs"
                    />
                    <span className="font-bold text-gray-900">
                      {formatPkr((prod?.basePricePkr || 0) * item.quantity)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors disabled:opacity-50"
        >
          {submitting ? 'Placing Order...' : 'Confirm & Save WhatsApp Order'}
        </button>
      </form>
    </div>
  );
};

