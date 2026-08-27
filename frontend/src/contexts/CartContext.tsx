import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types';
import { useToast } from './ToastContext';

interface AppliedCoupon {
  code: string;
  description?: string;
  discountAmount: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedVariant?: any) => void;
  removeFromCart: (itemKey: string) => void;
  updateQuantity: (itemKey: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  deliveryType: 'PICKUP' | 'DELIVERY';
  setDeliveryType: (type: 'PICKUP' | 'DELIVERY') => void;
  deliveryFee: number;
  appliedCoupon: AppliedCoupon | null;
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;
  discountAmount: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('warung_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [deliveryType, setDeliveryType] = useState<'PICKUP' | 'DELIVERY'>('PICKUP');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(() => {
    const saved = localStorage.getItem('warung_coupon');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const { showToast } = useToast();

  useEffect(() => {
    localStorage.setItem('warung_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('warung_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('warung_coupon');
    }
  }, [appliedCoupon]);

  const getItemKey = (item: { product: { id: string }; selectedVariant?: { id?: string; name?: string } | null }) => {
    return item.selectedVariant ? `${item.product.id}-${item.selectedVariant.id || item.selectedVariant.name}` : item.product.id;
  };

  const addToCart = (product: Product, quantity = 1, selectedVariant?: any) => {
    const availableStock = selectedVariant ? selectedVariant.stock : product.stock;
    if (availableStock <= 0) {
      showToast('Maaf, stok varian produk ini sedang habis.', 'error');
      return;
    }

    const itemKey = selectedVariant ? `${product.id}-${selectedVariant.id || selectedVariant.name}` : product.id;
    const variantLabel = selectedVariant ? ` (${selectedVariant.name})` : '';

    setCart((prev) => {
      const existing = prev.find((item) => getItemKey(item) === itemKey);
      if (existing) {
        const newQty = Math.min(availableStock, existing.quantity + quantity);
        showToast(`Jumlah "${product.name}${variantLabel}" diperbarui (${newQty} di keranjang)`);
        return prev.map((item) =>
          getItemKey(item) === itemKey ? { ...item, quantity: newQty } : item
        );
      } else {
        const qty = Math.min(availableStock, quantity);
        showToast(`"${product.name}${variantLabel}" ditambahkan ke keranjang! 🎉`);
        return [...prev, { product, quantity: qty, selectedVariant: selectedVariant || null }];
      }
    });
  };

  const removeFromCart = (itemKey: string) => {
    setCart((prev) => prev.filter((item) => getItemKey(item) !== itemKey && item.product.id !== itemKey));
    showToast('Produk dihapus dari keranjang.', 'info');
  };

  const updateQuantity = (itemKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemKey);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (getItemKey(item) === itemKey || item.product.id === itemKey) {
          const availableStock = item.selectedVariant ? item.selectedVariant.stock : item.product.stock;
          const validQty = Math.min(availableStock, quantity);
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    localStorage.removeItem('warung_cart');
    localStorage.removeItem('warung_coupon');
  };

  const applyCoupon = (coupon: AppliedCoupon) => {
    setAppliedCoupon(coupon);
    showToast(`Kupon ${coupon.code} berhasil dipasang!`, 'success');
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Kupon diskon dilepas.', 'info');
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce((sum, item) => {
    const price = item.selectedVariant
      ? (item.selectedVariant.discountPrice ?? item.selectedVariant.price)
      : (item.product.discountPrice ?? item.product.price);
    return sum + price * item.quantity;
  }, 0);

  const deliveryFee = 0;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const totalAmount = Math.max(0, subtotal - discountAmount + deliveryFee);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        deliveryType,
        setDeliveryType,
        deliveryFee,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        discountAmount,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
