'use client';

import React from 'react';
import Link from 'next/link';
import { X, User as UserIcon, ChevronRight, Smartphone, Laptop, Headphones, Shirt, Home, Watch, ShieldCheck, Flame } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface MegaMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MegaMenuDrawer: React.FC<MegaMenuDrawerProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  if (!isOpen) return null;

  const categories = [
    { name: 'Mobiles & Tablets', slug: 'mobiles-tablets', icon: Smartphone },
    { name: 'Laptops & Computers', slug: 'laptops-computers', icon: Laptop },
    { name: 'Audio & Headphones', slug: 'audio-headphones', icon: Headphones },
    { name: 'Fashion & Apparel', slug: 'fashion-apparel', icon: Shirt },
    { name: 'Home & Kitchen', slug: 'home-kitchen', icon: Home },
    { name: 'Smart Watches', slug: 'smart-watches', icon: Watch },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer */}
      <div className="relative w-80 max-w-full bg-white h-full shadow-2xl flex flex-col z-10 animate-fade-in overflow-hidden">
        {/* User Header */}
        <div className="bg-amazon-navy px-6 py-4 flex items-center justify-between text-white border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xs text-gray-300 block">Hello,</span>
              <span className="text-sm font-bold text-white">
                {user ? user.name : 'Sign in'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white p-1 rounded-md"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto py-3 divide-y divide-gray-200">
          {/* Trending */}
          <div className="px-6 py-3 space-y-1">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
              Trending
            </h3>
            <Link
              href="/products?isLightningDeal=true"
              onClick={onClose}
              className="flex items-center justify-between py-2 text-sm text-gray-700 hover:text-amazon-orange font-medium"
            >
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amazon-deal-red" />
                <span>Today&apos;s Lightning Deals</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
            <Link
              href="/products?sort=featured"
              onClick={onClose}
              className="flex items-center justify-between py-2 text-sm text-gray-700 hover:text-amazon-orange font-medium"
            >
              <span>Best Sellers</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
          </div>

          {/* Shop by Department */}
          <div className="px-6 py-3 space-y-1">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
              Shop by Department
            </h3>
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.slug}
                  href={`/products?category=${cat.slug}`}
                  onClick={onClose}
                  className="flex items-center justify-between py-2 text-sm text-gray-700 hover:text-amazon-orange font-medium transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-gray-500" />
                    <span>{cat.name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              );
            })}
          </div>

          {/* Privacy & Settings */}
          <div className="px-6 py-3 space-y-1">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
              Help & Settings
            </h3>
            <Link
              href="/profile"
              onClick={onClose}
              className="flex items-center justify-between py-2 text-sm text-gray-700 hover:text-amazon-orange font-medium"
            >
              <span>Your Account</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
            <Link
              href="/orders"
              onClick={onClose}
              className="flex items-center justify-between py-2 text-sm text-gray-700 hover:text-amazon-orange font-medium"
            >
              <span>Returns & Orders</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
            <Link
              href="/privacy"
              onClick={onClose}
              className="flex items-center justify-between py-2 text-sm text-amazon-prime hover:underline font-semibold"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amazon-prime" />
                <span>DPDP Privacy Center</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
