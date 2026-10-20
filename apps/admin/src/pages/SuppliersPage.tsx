import React, { useEffect, useState } from 'react';
import { Supplier, SupplierCreateInput } from '@dropship/shared';
import { fetchAdminSuppliers, createSupplier, updateSupplier } from '../services/api';
import { Plus, Truck, Phone, Mail, MapPin, X, CheckCircle } from 'lucide-react';

export const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Lahore');
  const [address, setAddress] = useState('');
  const [fulfilmentTerms, setFulfilmentTerms] = useState('Same-day dispatch if confirmed before 2:00 PM.');
  const [returnPolicy, setReturnPolicy] = useState('7 days replacement for dead-on-arrival goods.');
  const [payoutTerms, setPayoutTerms] = useState('Weekly settlement upon courier COD remittance.');
  const [saving, setSaving] = useState(false);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminSuppliers();
      setSuppliers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleToggleActive = async (s: Supplier) => {
    try {
      const updated = await updateSupplier(s.id, { isActive: !s.isActive });
      setSuppliers((prev) => prev.map((item) => (item.id === s.id ? updated! : item)));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const input: SupplierCreateInput = {
        businessName,
        contactName,
        phone,
        email: email || undefined,
        city,
        address: address || undefined,
        fulfilmentTerms,
        returnPolicy,
        payoutTerms,
        isActive: true,
      };
      const created = await createSupplier(input);
      setSuppliers((prev) => [...prev, created]);
      setIsModalOpen(false);
      setBusinessName('');
      setContactName('');
      setPhone('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Dropshipping Suppliers</h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage your wholesale fulfillment partners, lead times, settlement cycles, and return warranties
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Dropship Supplier
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-400">Loading suppliers directory...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {suppliers.map((s) => (
            <div key={s.id} className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <h3 className="font-bold text-base text-gray-900">{s.businessName}</h3>
                  <div className="text-xs text-gray-500 mt-0.5">Contact: {s.contactName}</div>
                </div>
                <button
                  onClick={() => handleToggleActive(s)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    s.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {s.isActive ? 'Active Partner' : 'Inactive'}
                </button>
              </div>

              <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-mono">{s.phone}</span>
                </div>
                {s.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{s.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{s.city} {s.address ? `• ${s.address}` : ''}</span>
                </div>
              </div>

              {/* Commercial Terms */}
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
                <div>
                  <span className="font-bold text-gray-900 block text-[11px]">Dispatch Terms:</span>
                  <p className="text-gray-600">{s.fulfilmentTerms || 'Standard dispatch'}</p>
                </div>
                <div>
                  <span className="font-bold text-gray-900 block text-[11px]">Replacement Warranty:</span>
                  <p className="text-gray-600">{s.returnPolicy || 'Supplier terms apply'}</p>
                </div>
                <div>
                  <span className="font-bold text-gray-900 block text-[11px]">Payout & Remittance:</span>
                  <p className="text-gray-600">{s.payoutTerms || 'Upon COD settlement'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-gray-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Add Dropship Supplier Partner</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700">Business Name *</label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full p-2.5 border rounded-xl mt-1"
                    placeholder="e.g. Shah Alam Tech Hub"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full p-2.5 border rounded-xl mt-1"
                    placeholder="Mian Tariq"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-gray-700">Phone *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 border rounded-xl mt-1 font-mono"
                    placeholder="03001234567"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 border rounded-xl mt-1"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 border rounded-xl mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700">Warehouse Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 border rounded-xl mt-1"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700">Fulfilment & Dispatch Terms</label>
                <input
                  type="text"
                  value={fulfilmentTerms}
                  onChange={(e) => setFulfilmentTerms(e.target.value)}
                  className="w-full p-2.5 border rounded-xl mt-1"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700">Return & Replacement Policy</label>
                <input
                  type="text"
                  value={returnPolicy}
                  onChange={(e) => setReturnPolicy(e.target.value)}
                  className="w-full p-2.5 border rounded-xl mt-1"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700">Payout & Remittance Terms</label>
                <input
                  type="text"
                  value={payoutTerms}
                  onChange={(e) => setPayoutTerms(e.target.value)}
                  className="w-full p-2.5 border rounded-xl mt-1"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold"
                >
                  {saving ? 'Saving...' : 'Add Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

