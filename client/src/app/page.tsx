'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HeroCarousel } from '../components/home/HeroCarousel';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { LightningDeals } from '../components/home/LightningDeals';
import { ProductCard } from '../components/product/ProductCard';
import { initialProducts } from '../lib/mockData';
import { Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const bestsellers = initialProducts.slice(0, 4);
  const audioAndWearables = initialProducts.slice(4, 8);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Hero Promotional Carousel */}
      <HeroCarousel />

      {/* 2. Overlapping Multi-card Category Grid */}
      <CategoryGrid />

      {/* 3. Today's Lightning Deals with Live Countdown */}
      <LightningDeals />

      {/* 4. Best Sellers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                Best Sellers in Electronics & Tech
              </h2>
              <p className="text-xs text-gray-500">
                Top rated flagships with Prime 1-Day Delivery
              </p>
            </div>
            <Link
              href="/products?sort=featured"
              className="text-xs font-bold text-amazon-prime hover:text-amazon-prime-hover hover:underline flex items-center gap-1"
            >
              <span>See more</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {bestsellers.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Prime Promotional Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-[#002f36] via-[#00525d] to-[#007185] rounded-xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <span className="bg-white/20 text-white font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full inline-block">
              Prime Membership Benefits
            </span>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              Unlimited FREE fast delivery on millions of items
            </h3>
            <p className="text-xs text-gray-200 leading-relaxed">
              Enjoy exclusive early access to lightning deals, prime video streaming, and zero convenience fees on standard orders.
            </p>
          </div>
          <Link
            href="/products?isPrime=true"
            className="px-6 py-3 bg-amazon-btn-yellow hover:bg-amazon-btn-yellow-hover text-amazon-dark-text font-bold text-xs rounded-lg shadow-lg transition whitespace-nowrap"
          >
            Explore Prime Deals
          </Link>
        </div>
      </section>

      {/* 6. Audio & Wearables Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                Trending in Audio, Home & Wearables
              </h2>
              <p className="text-xs text-gray-500">
                Premium noise cancelling, smart appliances, and lifestyle gear
              </p>
            </div>
            <Link
              href="/products?category=audio-headphones"
              className="text-xs font-bold text-amazon-prime hover:text-amazon-prime-hover hover:underline flex items-center gap-1"
            >
              <span>See more</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {audioAndWearables.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
