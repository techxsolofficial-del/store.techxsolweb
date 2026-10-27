import React, { useEffect, useState } from 'react';
import { StoreSettings, UpdateSettingsInput } from '@dropship/shared';
import { fetchSettings, updateSettings } from '../services/api';
import { Settings, Save, Check } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAlert, setSavedAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchSettings()
      .then(setSettings)
      .catch((err) => setErrorMessage(err.message || 'Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setErrorMessage('');
    setSavedAlert(false);

    try {
      const updated = await updateSettings(settings);
      setSettings(updated);
      setSavedAlert(true);
      setTimeout(() => setSavedAlert(false), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save settings. Please check your inputs.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="p-8 text-center text-xs text-gray-400">Loading settings...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Store Configuration</h1>
          <p className="text-xs text-gray-500 mt-1">
            Configure store identity, WhatsApp ordering phone number, delivery fees, and policies
          </p>
        </div>

        {savedAlert && (
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold animate-fade-in shadow-xs border border-emerald-200">
            <Check className="w-4 h-4 text-emerald-600" /> Settings Saved! Changes applied across website.
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {errorMessage}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6 text-xs">
        {/* Brand Identity */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Brand Identity & Support
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-gray-700">Store Name</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full p-2.5 border rounded-xl mt-1 font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700">WhatsApp Order Number (without + sign)</label>
              <input
                type="text"
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                className="w-full p-2.5 border rounded-xl mt-1 font-mono text-emerald-800 font-bold"
                placeholder="923001234567"
              />
              <p className="text-[10px] text-gray-400 mt-0.5">International format e.g. 923001234567</p>
            </div>

            <div>
              <label className="font-semibold text-gray-700">Support Phone</label>
              <input
                type="text"
                value={settings.supportPhone}
                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                className="w-full p-2.5 border rounded-xl mt-1"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700">Support Email</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full p-2.5 border rounded-xl mt-1"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-gray-700">Brand Tagline</label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              className="w-full p-2.5 border rounded-xl mt-1"
            />
          </div>
        </div>

        {/* Shipping & COD Charges */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Nationwide Delivery & COD Rates (PKR)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-gray-700">Default Delivery Charge (PKR)</label>
              <input
                type="number"
                min={0}
                value={settings.defaultDeliveryChargePkr}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    defaultDeliveryChargePkr: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="w-full p-2.5 border rounded-xl mt-1 font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700">Free Delivery Threshold (PKR)</label>
              <input
                type="number"
                min={0}
                value={settings.freeDeliveryThresholdPkr}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    freeDeliveryThresholdPkr: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="w-full p-2.5 border rounded-xl mt-1 font-bold text-emerald-700"
              />
              <p className="text-[10px] text-gray-400 mt-0.5">Orders above this amount get free shipping</p>
            </div>
          </div>

          <div>
            <label className="font-semibold text-gray-700">Estimated Delivery Timeline</label>
            <input
              type="text"
              value={settings.estimatedDeliveryDays}
              onChange={(e) => setSettings({ ...settings, estimatedDeliveryDays: e.target.value })}
              className="w-full p-2.5 border rounded-xl mt-1"
            />
          </div>
        </div>

        {/* Policies */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Customer Facing Policies
          </h2>
          <div>
            <label className="font-semibold text-gray-700">COD Inspection Terms</label>
            <textarea
              rows={2}
              value={settings.codTerms}
              onChange={(e) => setSettings({ ...settings, codTerms: e.target.value })}
              className="w-full p-2.5 border rounded-xl mt-1"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700">Return Policy Summary</label>
            <textarea
              rows={2}
              value={settings.returnPolicySummary}
              onChange={(e) => setSettings({ ...settings, returnPolicySummary: e.target.value })}
              className="w-full p-2.5 border rounded-xl mt-1"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700">About Store Overview</label>
            <textarea
              rows={3}
              value={settings.aboutText}
              onChange={(e) => setSettings({ ...settings, aboutText: e.target.value })}
              className="w-full p-2.5 border rounded-xl mt-1"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving Settings...' : 'Save Store Settings'}
        </button>
      </form>
    </div>
  );
};

