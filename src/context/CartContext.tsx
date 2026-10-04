import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types';

interface CartContextType {
  cart: CartItem[];
  wishlist: Product[];
  referralCode: string | null;
  setReferralCode: (code: string | null) => void;
  addToCart: (product: Product, quantity?: number, size?: string, color?: string, customSellingPrice?: number) => void;
  updateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void;
  removeFromCart: (productId: string, size?: string, color?: string) => void;
  clearCart: () => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  cartCount: number;
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  couponCode: string;
  applyCoupon: (code: string) => boolean;
  couponError: string | null;
  // Reseller mode in cart
  isResellerOrdering: boolean;
  setIsResellerOrdering: (val: boolean) => void;
}

const CartContext = createContext<CartContextType>({
  cart: [],
  wishlist: [],
  referralCode: null,
  setReferralCode: () => {},
  addToCart: () => {},
  updateQuantity: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  toggleWishlist: () => {},
  isInWishlist: () => false,
  cartCount: 0,
  subtotal: 0,
  deliveryCharge: 70,
  discount: 0,
  total: 0,
  selectedDistrict: 'Dhaka',
  setSelectedDistrict: () => {},
  couponCode: '',
  applyCoupon: () => false,
  couponError: null,
  isResellerOrdering: false,
  setIsResellerOrdering: () => {},
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('shoplix_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('shoplix_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [referralCode, setReferralCodeState] = useState<string | null>(() => {
    return localStorage.getItem('shoplix_ref_code') || null;
  });

  const [selectedDistrict, setSelectedDistrict] = useState<string>('Dhaka');
  const [couponCode, setCouponCode] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isResellerOrdering, setIsResellerOrdering] = useState<boolean>(false);

  // Check URL params for ref code on first mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const refParam = params.get('ref') || params.get('referral');
      if (refParam) {
        setReferralCodeState(refParam.toUpperCase());
        localStorage.setItem('shoplix_ref_code', refParam.toUpperCase());
      }
    } catch (e) {
      console.warn('URL parsing error:', e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('shoplix_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('shoplix_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const setReferralCode = (code: string | null) => {
    setReferralCodeState(code);
    if (code) {
      localStorage.setItem('shoplix_ref_code', code);
    } else {
      localStorage.removeItem('shoplix_ref_code');
    }
  };

  const addToCart = (
    product: Product,
    quantity: number = 1,
    size?: string,
    color?: string,
    customSellingPrice?: number
  ) => {
    setCart((prev) => {
      const selectedSize = size || (product.sizes?.[0] || '');
      const selectedColor = color || (product.colors?.[0] || '');

      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        if (customSellingPrice !== undefined) {
          updated[existingIndex].customSellingPrice = customSellingPrice;
        }
        return updated;
      } else {
        return [
          ...prev,
          {
            product,
            quantity,
            selectedSize,
            selectedColor,
            customSellingPrice: customSellingPrice !== undefined ? customSellingPrice : product.salePrice,
          },
        ];
      }
    });
  };

  const updateQuantity = (productId: string, quantity: number, size?: string, color?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (
          item.product.id === productId &&
          (size === undefined || item.selectedSize === size) &&
          (color === undefined || item.selectedColor === color)
        ) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string, size?: string, color?: string) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.product.id === productId &&
            (size === undefined || item.selectedSize === size) &&
            (color === undefined || item.selectedColor === color)
          )
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setCouponCode('');
  };

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((p) => p.id === productId);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce((sum, item) => {
    const itemPrice = item.customSellingPrice !== undefined ? item.customSellingPrice : item.product.salePrice;
    return sum + itemPrice * item.quantity;
  }, 0);

  // Inside Dhaka = 70, Outside Dhaka = 130
  const isDhaka = selectedDistrict.toLowerCase().includes('dhaka');
  const deliveryCharge = cart.length === 0 ? 0 : isDhaka ? 70 : 130;

  const total = Math.max(0, subtotal + deliveryCharge - discount);

  const applyCoupon = (code: string): boolean => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setCouponError('Please enter a coupon code.');
      return false;
    }

    if (trimmed === 'SHOPLIX10') {
      const calculated = Math.round(subtotal * 0.1);
      setDiscount(calculated);
      setCouponCode(trimmed);
      setCouponError(null);
      return true;
    } else if (trimmed === 'WELCOME50') {
      setDiscount(50);
      setCouponCode(trimmed);
      setCouponError(null);
      return true;
    } else if (trimmed === 'RESELLER100') {
      setDiscount(100);
      setCouponCode(trimmed);
      setCouponError(null);
      return true;
    } else {
      setCouponError('Invalid coupon code. Try "SHOPLIX10" or "WELCOME50"');
      return false;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        referralCode,
        setReferralCode,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isInWishlist,
        cartCount,
        subtotal,
        deliveryCharge,
        discount,
        total,
        selectedDistrict,
        setSelectedDistrict,
        couponCode,
        applyCoupon,
        couponError,
        isResellerOrdering,
        setIsResellerOrdering,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
