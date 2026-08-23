'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingBag, Users, MapPin, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  const navItems = [
    { href: '/admin', label: 'Dashboard Overview', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Products & Inventory', icon: Package },
    { href: '/admin/orders', label: 'Orders & Fulfillment', icon: ShoppingBag },
  ];

  // Access check for admin role
  if (user && user.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white dark:bg-gray-800 rounded-lg shadow border border-red-200 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-600 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Administrator Privileges Required</h2>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          You are signed in as <strong className="text-gray-900 dark:text-white">{user.email}</strong>, which does not have Admin access.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2 bg-amazon-btn-yellow text-amazon-dark-text font-bold text-xs rounded shadow-sm"
        >
          Return to Storefront
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f2] dark:bg-[#0b0f17] text-gray-800 dark:text-gray-200 text-xs">
      {/* Top Admin Bar */}
      <div className="bg-[#131921] text-white px-6 py-3 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-amazon-orange font-bold hover:underline flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            <span>Storefront</span>
          </Link>
          <span className="text-gray-500">|</span>
          <span className="font-bold text-sm text-white tracking-wide">
            Amazon Enterprise Admin Console
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-amazon-orange text-amazon-navy font-black text-[10px] uppercase px-2 py-0.5 rounded">
            Root Admin
          </span>
          <span className="text-xs text-gray-300 font-semibold">{user?.email || 'admin@amazon.com'}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row gap-6">
        {/* Left Sidebar */}
        <div className="w-full md:w-64 space-y-2 flex-shrink-0">
          <div className="bg-white dark:bg-[#131926] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md font-bold transition ${
                    isActive
                      ? 'bg-amazon-orange text-white shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main Admin View */}
        <div className="flex-1 w-full">{children}</div>
      </div>
    </div>
  );
}
