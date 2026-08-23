'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, X, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../lib/utils';

export const CartDrawerModal: React.FC = () => {
  const { isCartDrawerOpen, setIsCartDrawerOpen, lastAddedItem, cart, itemCount } = useCart();

  if (!isCartDrawerOpen || !lastAddedItem) return null;

  const { product, variant, quantity } = lastAddedItem;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl max-w-xl w-full overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-[#f0f2f2] px-6 py-4 border-b border-gray-300 flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-700 font-bold text-base">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span>Added to Cart</span>
          </div>
          <button
            onClick={() => setIsCartDrawerOpen(false)}
            className="text-gray-500 hover:text-gray-900 p-1 rounded-md hover:bg-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item preview */}
        <div className="p-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-24 h-24 flex-shrink-0 bg-white p-1 rounded-md border border-gray-200">
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              className="object-contain"
            />
          </div>
          <div className="flex-1 space-y-1 text-center sm:text-left">
            <h4 className="text-sm font-bold text-gray-900 line-clamp-2">
              {product.title}
            </h4>
            {variant && (
              <p className="text-xs text-gray-600 font-medium">
                {variant.type}: <span className="text-gray-900">{variant.name}</span>
              </p>
            )}
            <p className="text-xs text-gray-600">
              Quantity: <span className="font-semibold text-gray-900">{quantity}</span>
            </p>
            <p className="text-base font-bold text-amazon-deal-red">
              {formatINR(product.price + (variant?.priceDelta || 0))}
            </p>
          </div>
        </div>

        {/* Subtotal & Action Buttons */}
        <div className="bg-[#fcfcfc] px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs text-gray-600">Cart subtotal ({itemCount} items):</span>
            <div className="text-lg font-bold text-gray-900">{formatINR(cart.subtotal)}</div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/cart"
              onClick={() => setIsCartDrawerOpen(false)}
              className="flex-1 sm:flex-none text-center px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-gray-800 shadow-sm transition"
            >
              Go to Cart
            </Link>
            <Link
              href="/checkout"
              onClick={() => setIsCartDrawerOpen(false)}
              className="flex-1 sm:flex-none text-center px-5 py-2.5 bg-amazon-btn-yellow hover:bg-amazon-btn-yellow-hover text-amazon-dark-text rounded-lg text-xs font-bold shadow-sm transition"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
