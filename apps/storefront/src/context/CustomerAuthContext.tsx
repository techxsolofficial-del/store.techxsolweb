import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CustomerProfile {
  name: string;
  phone: string;
  email?: string;
  city?: string;
  deliveryAddress?: string;
  deliveryInstructions?: string;
}

export interface AuthModalOptions {
  mode: 'welcome' | 'action';
  title?: string;
  description?: string;
  onContinue?: () => void;
}

interface CustomerAuthContextType {
  customer: CustomerProfile | null;
  isLoggedIn: boolean;
  login: (profile: CustomerProfile) => void;
  logout: () => void;
  updateProfile: (profile: Partial<CustomerProfile>) => void;
  isAuthModalOpen: boolean;
  authModalOptions: AuthModalOptions;
  openAuthModal: (options?: Partial<AuthModalOptions>) => void;
  closeAuthModal: (executeContinue?: boolean) => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

const CUSTOMER_STORAGE_KEY = 'apnabuy_customer_v1';
const WELCOME_DISMISSED_KEY = 'apnabuy_welcome_popup_seen';

export const CustomerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<CustomerProfile | null>(() => {
    try {
      const saved = localStorage.getItem(CUSTOMER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalOptions, setAuthModalOptions] = useState<AuthModalOptions>({
    mode: 'welcome',
  });

  // Automatically trigger welcome popup on first visit if not logged in
  useEffect(() => {
    if (!customer) {
      try {
        const dismissed = sessionStorage.getItem(WELCOME_DISMISSED_KEY);
        if (!dismissed) {
          const timer = setTimeout(() => {
            setAuthModalOptions({
              mode: 'welcome',
              title: 'Welcome to ApnaBuy! 🛍️',
              description: 'Sign in for fast order tracking and pre-filled delivery address, or continue shopping as a guest.',
            });
            setIsAuthModalOpen(true);
          }, 1200);
          return () => clearTimeout(timer);
        }
      } catch {
        // Ignore storage errors
      }
    }
  }, [customer]);

  const login = (profile: CustomerProfile) => {
    setCustomer(profile);
    try {
      localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(profile));
      sessionStorage.setItem(WELCOME_DISMISSED_KEY, 'true');
    } catch (e) {
      console.error('Failed to save customer', e);
    }
    // If there was an action pending, execute it
    if (authModalOptions.onContinue) {
      authModalOptions.onContinue();
    }
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setCustomer(null);
    try {
      localStorage.removeItem(CUSTOMER_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear customer', e);
    }
  };

  const updateProfile = (updated: Partial<CustomerProfile>) => {
    if (!customer) return;
    const newProfile = { ...customer, ...updated };
    setCustomer(newProfile);
    try {
      localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(newProfile));
    } catch (e) {
      console.error('Failed to update customer', e);
    }
  };

  const openAuthModal = (options?: Partial<AuthModalOptions>) => {
    setAuthModalOptions({
      mode: options?.mode || 'action',
      title: options?.title,
      description: options?.description,
      onContinue: options?.onContinue,
    });
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = (executeContinue = false) => {
    setIsAuthModalOpen(false);
    try {
      sessionStorage.setItem(WELCOME_DISMISSED_KEY, 'true');
    } catch {
      // Ignore
    }
    if (executeContinue && authModalOptions.onContinue) {
      authModalOptions.onContinue();
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        isLoggedIn: !!customer,
        login,
        logout,
        updateProfile,
        isAuthModalOpen,
        authModalOptions,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = (): CustomerAuthContextType => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
};

