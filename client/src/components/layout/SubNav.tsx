'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, Flame, Sparkles, ShieldCheck } from 'lucide-react';
import { MegaMenuDrawer } from './MegaMenuDrawer';

export const SubNav: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <div className="bg-amazon-navy-light text-white text-xs px-3 sm:px-4 py-1.5 flex items-center justify-between border-t border-gray-700 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 sm:gap-4 whitespace-nowrap">
          {/* All Mega Menu Trigger */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-1.5 px-2 py-1 rounded border border-transparent hover:border-white font-bold transition"
          >
            <Menu className="w-4 h-4" />
            <span>All</span>
          </button>

          {/* Quick Category Links */}
          <Link
            href="/products?isLightningDeal=true"
            className="flex items-center gap-1 px-2 py-1 rounded border border-transparent hover:border-white font-semibold text-amazon-gold hover:text-white transition"
          >
            <Flame className="w-3.5 h-3.5 text-amazon-deal-red" />
            <span>Today&apos;s Deals</span>
          </Link>

          <Link
            href="/products?category=mobiles-tablets"
            className="px-2 py-1 rounded border border-transparent hover:border-white text-gray-200 hover:text-white transition"
          >
            Mobiles
          </Link>

          <Link
            href="/products?category=laptops-computers"
            className="px-2 py-1 rounded border border-transparent hover:border-white text-gray-200 hover:text-white transition"
          >
            Laptops & Tech
          </Link>

          <Link
            href="/products?category=audio-headphones"
            className="px-2 py-1 rounded border border-transparent hover:border-white text-gray-200 hover:text-white transition"
          >
            Audio & Electronics
          </Link>

          <Link
            href="/products?category=fashion-apparel"
            className="px-2 py-1 rounded border border-transparent hover:border-white text-gray-200 hover:text-white transition"
          >
            Fashion
          </Link>

          <Link
            href="/products?category=home-kitchen"
            className="px-2 py-1 rounded border border-transparent hover:border-white text-gray-200 hover:text-white transition"
          >
            Home & Kitchen
          </Link>

          <Link
            href="/products?isPrime=true"
            className="px-2 py-1 rounded border border-transparent hover:border-white text-blue-400 hover:text-blue-300 font-bold transition"
          >
            Prime
          </Link>
        </div>

        {/* Right DPDP Quick link */}
        <div className="hidden md:flex items-center gap-1">
          <Link
            href="/privacy"
            className="flex items-center gap-1.5 px-2 py-1 rounded border border-transparent hover:border-white text-amazon-gold hover:text-white font-semibold transition"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>DPDP Privacy Governance</span>
          </Link>
        </div>
      </div>

      <MegaMenuDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
};
