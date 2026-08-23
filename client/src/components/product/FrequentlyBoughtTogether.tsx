'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Plus, Check, ShoppingCart } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../lib/utils';

interface FrequentlyBoughtTogetherProps {
  mainProduct: Product;
  relatedProducts: Product[];
}

export const FrequentlyBoughtTogether: React.FC<FrequentlyBoughtTogetherProps> = ({
  mainProduct,
  relatedProducts,
}) => {
  const { addToCart } = useCart();
  const bundleItems = [mainProduct, ...relatedProducts.slice(0, 2)];
  const [selectedIds, setSelectedIds] = useState<string[]>(bundleItems.map((i) => i._id));
  const [isAdded, setIsAdded] = useState(false);

  const toggleItem = (id: string) => {
    if (id === mainProduct._id) return; // Main product is always included
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedItems = bundleItems.filter((i) => selectedIds.includes(i._id));
  const totalBundlePrice = selectedItems.reduce((acc, curr) => acc + curr.price, 0);

  const handleAddBundle = () => {
    selectedItems.forEach((item) => {
      addToCart(item, item.variants?.[0], 1);
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2500);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4 my-8">
      <h3 className="text-base font-bold text-gray-900 tracking-tight">
        Frequently bought together
      </h3>

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Images with Plus signs */}
        <div className="flex flex-wrap items-center gap-3">
          {bundleItems.map((item, idx) => (
            <React.Fragment key={item._id}>
              <div
                className={`relative w-24 h-24 bg-white p-2 rounded-md border transition ${
                  selectedIds.includes(item._id)
                    ? 'border-gray-300 opacity-100'
                    : 'border-dashed border-gray-200 opacity-40'
                }`}
              >
                <Image src={item.thumbnail} alt={item.title} fill className="object-contain p-1" />
              </div>
              {idx < bundleItems.length - 1 && (
                <Plus className="w-5 h-5 text-gray-400 flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Total Price & Add All Button */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 w-full lg:w-80 space-y-2">
          <div className="text-xs text-gray-600">
            Total price for {selectedItems.length} items:
          </div>
          <div className="text-xl font-bold text-amazon-deal-red">
            {formatINR(totalBundlePrice)}
          </div>
          <button
            onClick={handleAddBundle}
            className={`w-full py-2.5 rounded-lg font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition ${
              isAdded
                ? 'bg-green-600 text-white'
                : 'bg-amazon-btn-yellow hover:bg-amazon-btn-yellow-hover text-amazon-dark-text'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>All {selectedItems.length} Items Added!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Add all {selectedItems.length} to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Checkbox selectors */}
      <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
        {bundleItems.map((item) => (
          <label
            key={item._id}
            className={`flex items-start gap-2.5 cursor-pointer ${
              item._id === mainProduct._id ? 'cursor-default' : ''
            }`}
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(item._id)}
              disabled={item._id === mainProduct._id}
              onChange={() => toggleItem(item._id)}
              className="mt-0.5 rounded text-amazon-orange focus:ring-amazon-orange"
            />
            <span className="text-gray-700">
              <strong className="text-gray-900 font-bold">
                {item._id === mainProduct._id ? 'This item: ' : ''}
              </strong>
              {item.title} — <strong className="text-amazon-deal-red">{formatINR(item.price)}</strong>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};
