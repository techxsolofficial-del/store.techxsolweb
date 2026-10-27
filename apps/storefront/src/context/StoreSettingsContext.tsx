import React, { createContext, useContext, useState, useEffect } from 'react';
import { StoreSettings } from '@dropship/shared';
import { fetchPublicSettings } from '../services/api';

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'ApnaBuy',
  tagline: 'Pakistan Ka Apna Store - Cash on Delivery Nationwide',
  whatsappNumber: '923001234567',
  supportEmail: 'support@apnabuy.pk',
  supportPhone: '0300 1234567',
  currency: 'PKR',
  defaultDeliveryChargePkr: 250,
  freeDeliveryThresholdPkr: 3500,
  estimatedDeliveryDays: '2 to 4 business days',
  codTerms: 'Pay cash only upon receiving and inspecting parcel seal.',
  returnPolicySummary: '7-day easy replacement policy for damaged or defective products.',
  aboutText: 'ApnaBuy is a premier Pakistani online shopping storefront curating high-utility gadgets, home essentials, and grooming devices with nationwide Cash on Delivery.',
};

interface StoreSettingsContextType {
  settings: StoreSettings;
  whatsappNumber: string;
  supportPhone: string;
  supportEmail: string;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const StoreSettingsContext = createContext<StoreSettingsContextType>({
  settings: DEFAULT_SETTINGS,
  whatsappNumber: DEFAULT_SETTINGS.whatsappNumber,
  supportPhone: DEFAULT_SETTINGS.supportPhone,
  supportEmail: DEFAULT_SETTINGS.supportEmail,
  loading: false,
  refreshSettings: async () => {},
});

export const StoreSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      const data = await fetchPublicSettings();
      if (data) {
        setSettings(data);
      }
    } catch (e) {
      console.warn('Could not load live settings, using defaults', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <StoreSettingsContext.Provider
      value={{
        settings,
        whatsappNumber: settings.whatsappNumber || DEFAULT_SETTINGS.whatsappNumber,
        supportPhone: settings.supportPhone || DEFAULT_SETTINGS.supportPhone,
        supportEmail: settings.supportEmail || DEFAULT_SETTINGS.supportEmail,
        loading,
        refreshSettings: loadSettings,
      }}
    >
      {children}
    </StoreSettingsContext.Provider>
  );
};

export const useStoreSettings = (): StoreSettingsContextType => {
  return useContext(StoreSettingsContext);
};

