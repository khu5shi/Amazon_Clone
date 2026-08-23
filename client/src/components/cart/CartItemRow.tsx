'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, BookmarkPlus } from 'lucide-react';
import { CartItem } from '../../types';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../lib/utils';

interface CartItemRowProps {
  item: CartItem;
  isSavedForLater?: boolean;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({ item, isSavedForLater = false }) => {
  const { updateQuantity, toggleItemSelection, removeFromCart, saveForLater, moveToCart } = useCart();
  const product = item.product;

  return (
    <div className="py-4 border-b border-gray-200 flex flex-col sm:flex-row items-start gap-4">
      {/* Checkbox */}
      {!isSavedForLater && (
        <input
          type="checkbox"
          checked={item.selected}
          onChange={() => toggleItemSelection(item._id || '')}
          className="mt-2 rounded text-amazon-orange focus:ring-amazon-orange cursor-pointer"
        />
      )}

      {/* Image */}
      <Link
        href={`/products/${product.slug}`}
        className="relative w-28 h-28 bg-white p-1 rounded-md border border-gray-200 flex-shrink-0"
      >
        <Image src={product.thumbnail} alt={product.title} fill className="object-contain p-1" />
      </Link>

      {/* Item info */}
      <div className="flex-1 space-y-1.5">
        <Link
          href={`/products/${product.slug}`}
          className="text-sm font-bold text-gray-900 hover:text-amazon-orange line-clamp-2 leading-snug"
        >
          {product.title}
        </Link>

        {item.variantName && (
          <p className="text-xs text-gray-600 font-medium">
            Option: <span className="text-gray-900 font-semibold">{item.variantName}</span>
          </p>
        )}

        <div className="text-xs text-green-700 font-semibold">In stock</div>

        {product.isPrimeEligible && (
          <div className="flex items-center gap-1 text-[11px] text-gray-600">
            <span className="bg-blue-600 text-white text-[9px] font-black px-1 rounded">prime</span>
            <span>Eligible for FREE Shipping</span>
          </div>
        )}

        {/* Quantity Controls & Action Links */}
        <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
          {!isSavedForLater ? (
            <>
              {/* Quantity selector */}
              <div className="flex items-center border border-gray-300 rounded-md bg-gray-50 shadow-inner overflow-hidden">
                <button
                  onClick={() => updateQuantity(item._id || '', item.quantity - 1)}
                  className="px-2.5 py-1 text-gray-700 hover:bg-gray-200 font-bold transition"
                >
                  -
                </button>
                <span className="px-3 py-1 font-bold text-gray-900 bg-white border-x border-gray-300">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item._id || '', item.quantity + 1)}
                  className="px-2.5 py-1 text-gray-700 hover:bg-gray-200 font-bold transition"
                >
                  +
                </button>
              </div>

              <div className="h-4 w-px bg-gray-300 hidden sm:block" />

              <button
                onClick={() => removeFromCart(item._id || '')}
                className="text-amazon-prime hover:underline font-medium flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <div className="h-4 w-px bg-gray-300 hidden sm:block" />

              <button
                onClick={() => saveForLater(item._id || '')}
                className="text-amazon-prime hover:underline font-medium flex items-center gap-1"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>Save for later</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => moveToCart(item._id || '')}
                className="px-3 py-1 bg-amazon-btn-yellow hover:bg-amazon-btn-yellow-hover text-amazon-dark-text font-bold rounded-md shadow-sm transition"
              >
                Move to Cart
              </button>
              <button
                onClick={() => removeFromCart(item._id || '')}
                className="text-amazon-prime hover:underline font-medium"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="text-right sm:pl-4">
        <div className="text-base font-bold text-gray-900">{formatINR(item.price * item.quantity)}</div>
        {item.quantity > 1 && (
          <div className="text-[11px] text-gray-500 font-normal">
            ({formatINR(item.price)} each)
          </div>
        )}
      </div>
    </div>
  );
};
