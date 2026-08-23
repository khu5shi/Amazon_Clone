'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../lib/utils';

export const OrderSummaryCard: React.FC = () => {
  const { cart, selectedCount } = useCart();
  const isFreeDeliveryEligible = cart.subtotal >= 499 || cart.subtotal === 0;
  const remainingForFree = Math.max(0, 499 - cart.subtotal);

  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 space-y-4">
      {/* 1. Free delivery progress banner */}
      <div className="space-y-1.5 pb-3 border-b border-gray-200">
        {isFreeDeliveryEligible ? (
          <div className="flex items-center gap-1.5 text-xs text-green-700 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span>Your order is eligible for FREE Delivery.</span>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-xs text-gray-700">
              Add <strong className="text-amazon-deal-red">{formatINR(remainingForFree)}</strong> of eligible items to get <strong>FREE Delivery</strong>.
            </p>
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amazon-orange h-1.5 rounded-full"
                style={{ width: `${Math.min(100, (cart.subtotal / 499) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Subtotal */}
      <div className="space-y-1">
        <div className="text-base font-medium text-gray-900">
          Subtotal ({selectedCount} items):
        </div>
        <div className="text-2xl font-black text-gray-900">
          {formatINR(cart.subtotal)}
        </div>
      </div>

      {/* 3. Gift checkbox */}
      <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none">
        <input type="checkbox" className="rounded text-amazon-orange focus:ring-amazon-orange" />
        <span>This order contains a gift</span>
      </label>

      {/* 4. Checkout Button */}
      <Link
        href="/checkout"
        className={`w-full block text-center py-3 rounded-lg font-bold text-xs shadow-md transition ${
          selectedCount > 0
            ? 'bg-amazon-btn-yellow hover:bg-amazon-btn-yellow-hover text-amazon-dark-text'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none'
        }`}
      >
        Proceed to Checkout ({selectedCount} items)
      </Link>

      {/* 5. Breakdown */}
      <div className="space-y-1.5 pt-3 border-t border-gray-200 text-xs text-gray-600">
        <div className="flex justify-between">
          <span>Items total:</span>
          <span className="font-semibold text-gray-900">{formatINR(cart.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery fee:</span>
          <span className="font-semibold text-gray-900">
            {cart.deliveryFee === 0 ? (
              <span className="text-green-700 font-bold">FREE</span>
            ) : (
              formatINR(cart.deliveryFee)
            )}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Estimated 18% GST:</span>
          <span className="font-semibold text-gray-900">{formatINR(cart.estimatedTax)}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-gray-100 text-sm font-bold text-gray-900">
          <span>Order Total:</span>
          <span className="text-amazon-deal-red">{formatINR(cart.total)}</span>
        </div>
      </div>

      {/* Security badge */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 pt-2 border-t border-gray-100">
        <ShieldCheck className="w-3.5 h-3.5 text-amazon-prime" />
        <span>100% Safe & Secure Payments</span>
      </div>
    </div>
  );
};
