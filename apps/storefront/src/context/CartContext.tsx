import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@dropship/shared';

export interface CartItem {
  product: Product;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPricePkr: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, variantId?: string, variantName?: string) => void;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  clearCart: () => void;
  subtotalPkr: number;
  deliveryChargePkr: number;
  totalPayablePkr: number;
  itemCount: number;
  isFreeDelivery: boolean;
  freeDeliveryThresholdPkr: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'bazaarpk_cart_v1';
const DEFAULT_DELIVERY_FEE = 250;
const FREE_DELIVERY_THRESHOLD = 3500;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to persist cart to storage', e);
    }
  }, [items]);

  const addToCart = (product: Product, quantity = 1, variantId?: string, variantName?: string) => {
    setItems((prev) => {
      let unitPrice = product.basePricePkr;
      if (variantId && product.variants?.length > 0) {
        const v = product.variants.find((v) => v.id === variantId);
        if (v?.priceDeltaPkr) unitPrice += v.priceDeltaPkr;
      }

      const existingIndex = prev.findIndex(
        (i) => i.product.id === product.id && i.variantId === variantId
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = Math.min(20, updated[existingIndex].quantity + quantity);
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
        };
        return updated;
      }

      return [
        ...prev,
        {
          product,
          variantId,
          variantName,
          quantity: Math.min(20, Math.max(1, quantity)),
          unitPricePkr: unitPrice,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, variantId: string | undefined, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId && item.variantId === variantId) {
          return { ...item, quantity: Math.min(20, quantity) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string, variantId?: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.product.id === productId && i.variantId === variantId))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotalPkr = items.reduce((sum, item) => sum + item.unitPricePkr * item.quantity, 0);
  const isFreeDelivery = subtotalPkr >= FREE_DELIVERY_THRESHOLD && items.length > 0;
  const deliveryChargePkr = items.length === 0 ? 0 : isFreeDelivery ? 0 : DEFAULT_DELIVERY_FEE;
  const totalPayablePkr = subtotalPkr + deliveryChargePkr;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotalPkr,
        deliveryChargePkr,
        totalPayablePkr,
        itemCount,
        isFreeDelivery,
        freeDeliveryThresholdPkr: FREE_DELIVERY_THRESHOLD,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

