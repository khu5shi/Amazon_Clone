'use client';

import React from 'react';
import { Star, Check, RotateCcw } from 'lucide-react';
import { Category } from '../../types';

interface FacetSidebarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categorySlug: string) => void;
  selectedBrands: string[];
  onToggleBrand: (brand: string) => void;
  availableBrands: string[];
  isPrimeOnly: boolean;
  onTogglePrime: (val: boolean) => void;
  minRating: number | null;
  onSelectMinRating: (rating: number | null) => void;
  minPrice: number;
  maxPrice: number;
  onPriceChange: (min: number, max: number) => void;
  onResetFilters: () => void;
}

export const FacetSidebar: React.FC<FacetSidebarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedBrands,
  onToggleBrand,
  availableBrands,
  isPrimeOnly,
  onTogglePrime,
  minRating,
  onSelectMinRating,
  minPrice,
  maxPrice,
  onPriceChange,
  onResetFilters,
}) => {
  const [localMin, setLocalMin] = React.useState(minPrice);
  const [localMax, setLocalMax] = React.useState(maxPrice);

  const handleApplyPrice = (e: React.FormEvent) => {
    e.preventDefault();
    onPriceChange(localMin, localMax);
  };

  return (
    <aside className="w-full lg:w-64 bg-white p-5 rounded-lg shadow-sm border border-gray-200 space-y-6 text-xs text-gray-800">
      {/* Header with Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        <span className="font-bold text-sm text-gray-900">Filters</span>
        <button
          onClick={onResetFilters}
          className="flex items-center gap-1 text-amazon-prime hover:underline font-semibold"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Clear all</span>
        </button>
      </div>

      {/* 1. Amazon Prime */}
      <div className="space-y-2">
        <span className="font-bold text-xs text-gray-900 block uppercase tracking-wider">
          Delivery Day & Prime
        </span>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isPrimeOnly}
            onChange={(e) => onTogglePrime(e.target.checked)}
            className="w-4 h-4 rounded text-amazon-orange focus:ring-amazon-orange cursor-pointer"
          />
          <span className="bg-blue-600 text-white font-extrabold px-1.5 py-0.2 rounded text-[10px]">
            prime
          </span>
          <span className="text-xs text-gray-700">Prime Eligible Only</span>
        </label>
      </div>

      {/* 2. Departments / Categories */}
      <div className="space-y-2">
        <span className="font-bold text-xs text-gray-900 block uppercase tracking-wider">
          Department
        </span>
        <div className="space-y-1">
          <button
            onClick={() => onSelectCategory('all')}
            className={`block text-left w-full py-0.5 transition ${
              selectedCategory === 'all'
                ? 'font-bold text-amazon-orange'
                : 'text-gray-600 hover:text-amazon-orange'
            }`}
          >
            All Departments
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => onSelectCategory(cat.slug)}
              className={`block text-left w-full py-0.5 transition ${
                selectedCategory === cat.slug
                  ? 'font-bold text-amazon-orange'
                  : 'text-gray-600 hover:text-amazon-orange'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Customer Reviews */}
      <div className="space-y-2">
        <span className="font-bold text-xs text-gray-900 block uppercase tracking-wider">
          Customer Reviews
        </span>
        <div className="space-y-1.5">
          {[4, 3, 2].map((stars) => (
            <button
              key={stars}
              onClick={() => onSelectMinRating(minRating === stars ? null : stars)}
              className={`flex items-center gap-1.5 w-full text-left py-0.5 rounded transition ${
                minRating === stars ? 'font-bold text-amazon-orange bg-orange-50/50 px-1' : 'hover:bg-gray-50 px-1'
              }`}
            >
              <div className="flex items-center text-amazon-gold">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < stars ? 'fill-amazon-gold text-amazon-gold' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-700">& Up</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Brands */}
      <div className="space-y-2">
        <span className="font-bold text-xs text-gray-900 block uppercase tracking-wider">
          Brands
        </span>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {availableBrands.map((brand) => (
            <label key={brand} className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => onToggleBrand(brand)}
                className="w-4 h-4 rounded text-amazon-orange focus:ring-amazon-orange cursor-pointer"
              />
              <span className="text-xs text-gray-700">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 5. Price Range */}
      <div className="space-y-3">
        <span className="font-bold text-xs text-gray-900 block uppercase tracking-wider">
          Price Range (₹)
        </span>
        <form onSubmit={handleApplyPrice} className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={localMin}
            onChange={(e) => setLocalMin(Number(e.target.value))}
            placeholder="Min"
            className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-amazon-orange focus:outline-none"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            min={0}
            value={localMax}
            onChange={(e) => setLocalMax(Number(e.target.value))}
            placeholder="Max"
            className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-amazon-orange focus:outline-none"
          />
          <button
            type="submit"
            className="px-3 py-1 bg-white hover:bg-gray-100 border border-gray-300 rounded text-xs font-bold text-gray-800 shadow-sm transition"
          >
            Go
          </button>
        </form>
      </div>
    </aside>
  );
};
