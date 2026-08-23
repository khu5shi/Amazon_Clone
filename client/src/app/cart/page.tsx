'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, ArrowLeft, BookmarkCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { CartItemRow } from '../../components/cart/CartItemRow';
import { OrderSummaryCard } from '../../components/cart/OrderSummaryCard';
import { formatINR } from '../../lib/utils';

export default function CartPage() {
  const { cart, itemCount, toggleSelectAll } = useCart();
  const allSelected = cart.items.length > 0 && cart.items.every((i) => i.selected);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-xs text-gray-800">
      <div className="flex items-center justify-between pb-2">
        <Link
          href="/products"
          className="flex items-center gap-1 text-xs font-semibold text-amazon-prime hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Active Cart & Saved for Later (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Active Cart Box */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                  Shopping Cart
                </h1>
                <span className="text-xs text-gray-500">
                  {itemCount > 0 ? `${itemCount} items in cart` : 'Your cart is empty'}
                </span>
              </div>

              {cart.items.length > 0 && (
                <button
                  onClick={toggleSelectAll}
                  className="text-xs font-semibold text-amazon-prime hover:underline self-start sm:self-auto"
                >
                  {allSelected ? 'Deselect all items' : 'Select all items'}
                </button>
              )}
            </div>

            {/* Cart Items List */}
            {cart.items.length === 0 ? (
              <div className="py-12 text-center space-y-4">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-lg font-bold text-gray-900">Your Amazon Cart is empty</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Your shopping cart is waiting. Give it purpose — fill it with electronics, laptops, mobiles, and fashion deals!
                </p>
                <Link
                  href="/products"
                  className="inline-block px-6 py-2.5 bg-amazon-btn-yellow hover:bg-amazon-btn-yellow-hover text-amazon-dark-text font-bold rounded-lg shadow-sm transition"
                >
                  Shop Today&apos;s Deals
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {cart.items.map((item) => (
                  <CartItemRow key={item._id} item={item} />
                ))}
              </div>
            )}

            {/* Subtotal Bottom Bar */}
            {cart.items.length > 0 && (
              <div className="pt-4 flex justify-end text-sm text-gray-900">
                <span>
                  Subtotal ({cart.items.filter((i) => i.selected).reduce((acc, curr) => acc + curr.quantity, 0)} items):{' '}
                  <strong className="text-base font-black text-gray-900">
                    {formatINR(cart.subtotal)}
                  </strong>
                </span>
              </div>
            )}
          </div>

          {/* Saved for Later Box */}
          {cart.savedForLater.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                <BookmarkCheck className="w-5 h-5 text-amazon-prime" />
                <h2 className="text-base font-bold text-gray-900">
                  Saved for later ({cart.savedForLater.length} items)
                </h2>
              </div>

              <div className="divide-y divide-gray-100">
                {cart.savedForLater.map((item) => (
                  <CartItemRow key={item._id} item={item} isSavedForLater={true} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Summary Card (4 cols) */}
        {cart.items.length > 0 && (
          <div className="lg:col-span-4 sticky top-20">
            <OrderSummaryCard />
          </div>
        )}
      </div>
    </div>
  );
}
