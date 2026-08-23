'use client';

import React from 'react';
import { Variant } from '../../types';
import { formatINR } from '../../lib/utils';

interface VariantSelectorProps {
  variants: Variant[];
  selectedVariant?: Variant;
  onSelectVariant: (variant: Variant) => void;
  basePrice: number;
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedVariant,
  onSelectVariant,
  basePrice,
}) => {
  if (!variants || variants.length === 0) return null;

  // Group variants by type (e.g. 'storage', 'color', 'size')
  const groupedVariants = variants.reduce((acc, v) => {
    acc[v.type] = acc[v.type] || [];
    acc[v.type].push(v);
    return acc;
  }, {} as Record<string, Variant[]>);

  return (
    <div className="space-y-4 py-3 border-y border-gray-200">
      {Object.entries(groupedVariants).map(([type, list]) => (
        <div key={type} className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-600 capitalize">{type}:</span>
            <span className="font-bold text-gray-900">
              {selectedVariant?.type === type ? selectedVariant.name : list[0].name}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {list.map((v) => {
              const isSelected =
                (selectedVariant && (selectedVariant._id === v._id || selectedVariant.sku === v.sku)) ||
                (!selectedVariant && list[0].sku === v.sku);

              return (
                <button
                  key={v.sku}
                  onClick={() => onSelectVariant(v)}
                  className={`px-3 py-2 rounded-md border text-xs font-semibold transition flex flex-col items-start ${
                    isSelected
                      ? 'border-amazon-orange bg-orange-50/50 ring-1 ring-amazon-orange text-amazon-dark-text shadow-sm'
                      : 'border-gray-300 hover:border-gray-400 bg-white text-gray-700'
                  }`}
                >
                  <span>{v.name}</span>
                  <span className="text-[10px] text-gray-500 font-normal">
                    {formatINR(basePrice + v.priceDelta)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
