'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Flame, Clock, ShoppingCart, Check } from 'lucide-react';
import { initialProducts } from '../../lib/mockData';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../lib/utils';

export const LightningDeals: React.FC = () => {
  const { addToCart } = useCart();
  const [timeLeft, setTimeLeft] = useState({ hours: 7, minutes: 42, seconds: 18 });
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 0, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const deals = initialProducts.filter((p) => p.isLightningDeal || p.discountPercentage >= 10);

  const handleQuickAdd = (product: any) => {
    addToCart(product, product.variants?.[0], 1);
    setAddedIds((prev) => ({ ...prev, [product._id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product._id]: false }));
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 my-8">
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        {/* Title Header with Countdown Timer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-amazon-deal-red text-white px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider">
              <Flame className="w-4 h-4 fill-white" />
              <span>Today&apos;s Lightning Deals</span>
            </div>
            <span className="text-sm font-bold text-gray-900 hidden md:inline">
              Up to 40% off limited-time deals
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
            <Clock className="w-4 h-4 text-amazon-deal-red" />
            <span>Ends in:</span>
            <span className="font-mono font-bold text-amazon-deal-red">
              {String(timeLeft.hours).padStart(2, '0')}:
              {String(timeLeft.minutes).padStart(2, '0')}:
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Horizontal Deals Carousel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 pt-6">
          {deals.slice(0, 4).map((product) => {
            const isAdded = addedIds[product._id];
            return (
              <div
                key={product._id}
                className="group flex flex-col justify-between p-4 rounded-lg border border-gray-200 hover:border-amazon-orange hover:shadow-lg transition bg-white"
              >
                <div>
                  {/* Thumbnail */}
                  <Link
                    href={`/products/${product.slug}`}
                    className="relative w-full h-44 block bg-gray-50 rounded-md overflow-hidden p-2 mb-3"
                  >
                    <Image
                      src={product.thumbnail}
                      alt={product.title}
                      fill
                      className="object-contain group-hover:scale-105 transition duration-300"
                    />
                    <span className="absolute top-2 left-2 bg-amazon-deal-red text-white text-[10px] font-black px-2 py-0.5 rounded shadow">
                      {product.discountPercentage}% OFF
                    </span>
                  </Link>

                  {/* Title & Brand */}
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    {product.brand}
                  </span>
                  <Link
                    href={`/products/${product.slug}`}
                    className="text-xs font-bold text-gray-900 hover:text-amazon-orange line-clamp-2 block mt-0.5 leading-snug"
                  >
                    {product.title}
                  </Link>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-base font-bold text-gray-900">
                      {formatINR(product.price)}
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatINR(product.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Progress bar for claimed */}
                  <div className="mt-3 space-y-1">
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-amazon-orange h-1.5 rounded-full"
                        style={{
                          width: `${product.lightningDealClaimedPercentage || 75}%`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-500 block">
                      {product.lightningDealClaimedPercentage || 75}% claimed
                    </span>
                  </div>
                </div>

                {/* Quick Add Button */}
                <button
                  onClick={() => handleQuickAdd(product)}
                  className={`mt-4 w-full py-2 rounded-md font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition ${
                    isAdded
                      ? 'bg-green-600 text-white'
                      : 'bg-amazon-btn-yellow hover:bg-amazon-btn-yellow-hover text-amazon-dark-text'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
