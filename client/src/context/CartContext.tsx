'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Cart, CartItem, Product, Variant } from '../types';
import { initialProducts } from '../lib/mockData';
import { apiClient } from '../lib/api';
import { useToast } from './ToastContext';

interface CartContextType {
  cart: Cart;
  itemCount: number;
  selectedCount: number;
  addToCart: (product: Product, variant?: Variant, quantity?: number) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  toggleItemSelection: (itemId: string) => void;
  toggleSelectAll: () => void;
  removeFromCart: (itemId: string) => void;
  saveForLater: (itemId: string) => void;
  moveToCart: (itemId: string) => void;
  clearCart: () => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  lastAddedItem: { product: Product; variant?: Variant; quantity: number } | null;
}

const initialCartState: Cart = {
  items: [],
  savedForLater: [],
  subtotal: 0,
  totalDiscount: 0,
  deliveryFee: 0,
  estimatedTax: 0,
  total: 0,
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [cart, setCart] = useState<Cart>(initialCartState);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<{
    product: Product;
    variant?: Variant;
    quantity: number;
  } | null>(null);

  // Recalculate totals helper
  const calculateTotals = (items: CartItem[], savedForLater: CartItem[]): Cart => {
    let subtotal = 0;
    let totalDiscount = 0;

    for (const item of items) {
      if (item.selected) {
        subtotal += item.price * item.quantity;
        if (item.product.originalPrice > item.price) {
          totalDiscount += (item.product.originalPrice - item.price) * item.quantity;
        }
      }
    }

    const deliveryFee = subtotal >= 499 || subtotal === 0 ? 0 : 40;
    const estimatedTax = Math.round(subtotal * 0.18);
    const total = subtotal + deliveryFee + estimatedTax;

    return {
      items,
      savedForLater,
      subtotal,
      totalDiscount,
      deliveryFee,
      estimatedTax,
      total,
    };
  };

  // Load cart from LocalStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('amzn_cart');
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    } catch (e) {
      // Use initial cart
    }
  }, []);

  // Save cart to LocalStorage on updates
  const updateCartState = (newCart: Cart) => {
    setCart(newCart);
    localStorage.setItem('amzn_cart', JSON.stringify(newCart));
  };

  const addToCart = (product: Product, variant?: Variant, quantity: number = 1) => {
    let itemPrice = product.price;
    if (variant) {
      itemPrice += variant.priceDelta;
    }

    const existingIndex = cart.items.findIndex(
      (item) =>
        item.product._id === product._id &&
        (variant ? item.variantId === (variant._id || variant.sku) : !item.variantId)
    );

    let updatedItems = [...cart.items];
    if (existingIndex > -1) {
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantity: updatedItems[existingIndex].quantity + quantity,
      };
    } else {
      updatedItems.push({
        _id: `item_${Date.now()}_${Math.random()}`,
        product,
        variantId: variant ? variant._id || variant.sku : undefined,
        variantName: variant ? `${variant.type}: ${variant.name}` : undefined,
        quantity,
        price: itemPrice,
        selected: true,
      });
    }

    const newCart = calculateTotals(updatedItems, cart.savedForLater);
    updateCartState(newCart);

    // Track last added item and open feedback modal/drawer
    setLastAddedItem({ product, variant, quantity });
    setIsCartDrawerOpen(true);
    toast.success('Added to Cart', `${product.title.slice(0, 32)}...`);

    try {
      apiClient.post('/cart/items', {
        productId: product._id,
        variantId: variant ? variant._id || variant.sku : undefined,
        variantName: variant ? `${variant.type}: ${variant.name}` : undefined,
        quantity,
      });
    } catch (e) {
      // Managed in client state
    }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    let updatedItems: CartItem[];
    if (quantity <= 0) {
      updatedItems = cart.items.filter((item) => item._id !== itemId);
      toast.info('Item Removed', 'Product was removed from your cart.');
    } else {
      updatedItems = cart.items.map((item) =>
        item._id === itemId ? { ...item, quantity } : item
      );
    }

    const newCart = calculateTotals(updatedItems, cart.savedForLater);
    updateCartState(newCart);
  };

  const toggleItemSelection = (itemId: string) => {
    const updatedItems = cart.items.map((item) =>
      item._id === itemId ? { ...item, selected: !item.selected } : item
    );
    const newCart = calculateTotals(updatedItems, cart.savedForLater);
    updateCartState(newCart);
  };

  const toggleSelectAll = () => {
    const allSelected = cart.items.every((i) => i.selected);
    const updatedItems = cart.items.map((item) => ({ ...item, selected: !allSelected }));
    const newCart = calculateTotals(updatedItems, cart.savedForLater);
    updateCartState(newCart);
  };

  const removeFromCart = (itemId: string) => {
    const updatedItems = cart.items.filter((item) => item._id !== itemId);
    const newCart = calculateTotals(updatedItems, cart.savedForLater);
    updateCartState(newCart);
    toast.info('Item Removed', 'Product was removed from your cart.');
  };

  const saveForLater = (itemId: string) => {
    const itemToSave = cart.items.find((i) => i._id === itemId);
    if (!itemToSave) return;

    const updatedItems = cart.items.filter((i) => i._id !== itemId);
    const updatedSaved = [...cart.savedForLater, itemToSave];
    const newCart = calculateTotals(updatedItems, updatedSaved);
    updateCartState(newCart);
    toast.info('Saved for Later', 'Moved item to your Saved for Later list.');
  };

  const moveToCart = (itemId: string) => {
    const itemToMove = cart.savedForLater.find((i) => i._id === itemId);
    if (!itemToMove) return;

    const updatedSaved = cart.savedForLater.filter((i) => i._id !== itemId);
    const updatedItems = [...cart.items, itemToMove];
    const newCart = calculateTotals(updatedItems, updatedSaved);
    updateCartState(newCart);
    toast.success('Moved to Cart', 'Item restored to your active cart.');
  };

  const clearCart = () => {
    const newCart = calculateTotals([], cart.savedForLater);
    updateCartState(newCart);
  };

  const itemCount = cart.items.reduce((acc, curr) => acc + curr.quantity, 0);
  const selectedCount = cart.items
    .filter((i) => i.selected)
    .reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        selectedCount,
        addToCart,
        updateQuantity,
        toggleItemSelection,
        toggleSelectAll,
        removeFromCart,
        saveForLater,
        moveToCart,
        clearCart,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        lastAddedItem,
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
