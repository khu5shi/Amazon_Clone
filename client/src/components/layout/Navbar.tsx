'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, MapPin, ChevronDown, User as UserIcon, ShieldCheck, LogOut, Check, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { LocationModal } from './LocationModal';
import { formatINR } from '../../lib/utils';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const { itemCount, cart } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?keyword=${encodeURIComponent(searchQuery.trim())}&category=${selectedCategory}`);
    } else if (selectedCategory !== 'all') {
      router.push(`/products?category=${selectedCategory}`);
    } else {
      router.push('/products');
    }
  };

  const [osmLocation, setOsmLocation] = useState<{ city: string; postalCode: string } | null>(null);

  // Load OSM live location from localStorage
  React.useEffect(() => {
    try {
      const storedLoc = localStorage.getItem('amzn_user_location');
      if (storedLoc) {
        setOsmLocation(JSON.parse(storedLoc));
      }
    } catch (e) {
      // Ignored
    }
  }, [isLocationModalOpen]);

  const defaultAddress = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];
  const displayLocation = defaultAddress
    ? `${defaultAddress.city} ${defaultAddress.postalCode}`
    : osmLocation
    ? `${osmLocation.city} ${osmLocation.postalCode}`
    : 'Select location';

  return (
    <>
      <header className="bg-amazon-navy text-white text-xs sticky top-0 z-40 shadow-md">
        <div className="max-w-[1500px] mx-auto flex items-center justify-between px-3 sm:px-4 py-2 gap-2 sm:gap-4">
          {/* 1. Amazon Logo */}
          <Link
            href="/"
            className="flex items-center gap-1 p-2 rounded border border-transparent hover:border-white transition flex-shrink-0"
          >
            <span className="text-xl sm:text-2xl font-black tracking-tighter text-white">
              amazon<span className="text-amazon-orange text-xs font-bold">.in</span>
            </span>
            <span className="bg-gradient-to-r from-blue-500 to-amazon-prime text-[10px] font-extrabold px-1.5 py-0.5 rounded text-white ml-1">
              prime
            </span>
          </Link>

          {/* 2. Deliver To Location */}
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="hidden md:flex items-center gap-1.5 p-2 rounded border border-transparent hover:border-white text-left transition flex-shrink-0"
          >
            <MapPin className="w-4 h-4 text-white self-center" />
            <div>
              <span className="text-[11px] text-gray-300 block">
                Deliver to {user?.name?.split(' ')[0] || 'Customer'}
              </span>
              <span className="text-xs font-bold text-white block truncate max-w-[130px]">
                {displayLocation}
              </span>
            </div>
          </button>

          {/* 3. Search Bar */}
          <form
            onSubmit={handleSearch}
            className="flex-1 flex items-center h-10 rounded-md overflow-hidden bg-white shadow-inner focus-within:ring-2 focus-within:ring-amazon-orange max-w-3xl"
          >
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-full bg-gray-100 text-gray-700 text-xs px-2 border-r border-gray-300 focus:outline-none cursor-pointer hidden sm:block hover:bg-gray-200"
            >
              <option value="all">All Departments</option>
              <option value="mobiles-tablets">Mobiles & Tablets</option>
              <option value="laptops-computers">Laptops & Computers</option>
              <option value="audio-headphones">Audio & Headphones</option>
              <option value="fashion-apparel">Fashion & Apparel</option>
              <option value="home-kitchen">Home & Kitchen</option>
              <option value="smart-watches">Smart Watches</option>
            </select>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Amazon.in (e.g. iPhone, Sony, M3 Max, Philips...)"
              className="flex-1 px-3 text-sm text-gray-900 focus:outline-none"
            />

            <button
              type="submit"
              className="h-full px-4 bg-amazon-gold hover:bg-[#f3a847] flex items-center justify-center transition"
            >
              <Search className="w-5 h-5 text-amazon-navy" />
            </button>
          </form>

          {/* 4. Right Controls */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Account & Lists Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                onMouseEnter={() => setIsAccountDropdownOpen(true)}
                className="p-2 rounded border border-transparent hover:border-white text-left transition flex items-center gap-1"
              >
                <div>
                  <span className="text-[11px] text-gray-300 block">
                    Hello, {user ? user.name.split(' ')[0] : 'sign in'}
                  </span>
                  <span className="text-xs font-bold text-white flex items-center gap-0.5">
                    <span>Account & Lists</span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </span>
                </div>
              </button>

              {/* Hover/Click Menu */}
              {isAccountDropdownOpen && (
                <div
                  onMouseLeave={() => setIsAccountDropdownOpen(false)}
                  className="absolute right-0 top-full mt-1 w-64 bg-white text-gray-900 rounded-lg shadow-2xl border border-gray-200 py-3 z-50 animate-fade-in"
                >
                  <div className="px-4 pb-3 border-b border-gray-200">
                    {isAuthenticated ? (
                      <div>
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="font-bold text-sm text-gray-900 truncate">{user?.email}</p>
                        <p className="text-[11px] text-green-700 font-semibold mt-0.5">
                          DPDP Consent Active
                        </p>
                      </div>
                    ) : (
                      <Link
                        href="/auth/login"
                        className="w-full block text-center py-2 bg-amazon-btn-yellow hover:bg-amazon-btn-yellow-hover text-amazon-dark-text rounded-md font-bold text-xs shadow-sm transition"
                      >
                        Sign in
                      </Link>
                    )}
                  </div>

                  <div className="py-2 text-xs divide-y divide-gray-100">
                    <div className="px-4 py-2 space-y-2">
                      <span className="font-bold text-gray-900 block text-[11px] uppercase tracking-wider">
                        Your Account
                      </span>
                      <Link href="/profile" className="block text-gray-700 hover:text-amazon-orange">
                        Your Profile & Addresses
                      </Link>
                      <Link href="/orders" className="block text-gray-700 hover:text-amazon-orange">
                        Your Orders & Invoices
                      </Link>
                      {user?.role === 'admin' && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-1.5 text-amazon-orange font-bold hover:underline"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Admin Portal & Fulfillment</span>
                        </Link>
                      )}
                      <Link
                        href="/privacy"
                        className="flex items-center gap-1.5 text-amazon-prime font-semibold hover:underline"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>DPDP Privacy Center</span>
                      </Link>
                    </div>

                    {isAuthenticated && (
                      <div className="px-4 pt-2">
                        <button
                          onClick={logout}
                          className="flex items-center gap-1.5 text-red-600 hover:text-red-800 font-semibold py-1 w-full text-left"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Returns & Orders */}
            <Link
              href="/orders"
              className="hidden lg:block p-2 rounded border border-transparent hover:border-white text-left transition"
            >
              <span className="text-[11px] text-gray-300 block">Returns</span>
              <span className="text-xs font-bold text-white block">& Orders</span>
            </Link>

            {/* Theme Toggle (Light / Dark Mode) */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              className="flex items-center gap-1 p-2 rounded border border-transparent hover:border-white transition text-gray-200 hover:text-white"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-amazon-gold" />
              ) : (
                <Sun className="w-5 h-5 text-amazon-orange" />
              )}
              <span className="hidden xl:inline text-[11px] font-semibold capitalize">
                {theme}
              </span>
            </button>

            {/* Cart Button */}
            <Link
              href="/cart"
              className="flex items-center gap-1.5 p-2 rounded border border-transparent hover:border-white transition relative"
            >
              <div className="relative">
                <ShoppingCart className="w-7 h-7 text-white" />
                <span className="absolute -top-1 left-3 bg-amazon-orange text-amazon-navy font-black text-xs px-1.5 py-0.2 rounded-full min-w-[18px] text-center">
                  {itemCount}
                </span>
              </div>
              <div className="hidden sm:block">
                <span className="text-[11px] text-gray-300 block leading-tight">Cart</span>
                <span className="text-xs font-bold text-amazon-gold block leading-tight">
                  {formatINR(cart.subtotal)}
                </span>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </>
  );
};
