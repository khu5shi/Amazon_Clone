'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FacetSidebar } from '../../components/filter/FacetSidebar';
import { ProductCard } from '../../components/product/ProductCard';
import { initialProducts, initialCategories } from '../../lib/mockData';
import { Product } from '../../types';
import { Filter, ArrowUpDown, Loader2 } from 'lucide-react';

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlCategory = searchParams.get('category') || 'all';
  const urlKeyword = searchParams.get('keyword') || '';
  const urlPrime = searchParams.get('isPrime') === 'true';
  const urlDeal = searchParams.get('isLightningDeal') === 'true';
  const urlSort = searchParams.get('sort') || 'featured';

  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [isPrimeOnly, setIsPrimeOnly] = useState(urlPrime);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500000);
  const [sortBy, setSortBy] = useState(urlSort);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync state if URL searchParams change
  useEffect(() => {
    if (urlCategory) setSelectedCategory(urlCategory);
    if (urlPrime !== isPrimeOnly) setIsPrimeOnly(urlPrime);
  }, [urlCategory, urlPrime]);

  // Extract available brands
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    initialProducts.forEach((p) => {
      if (selectedCategory === 'all' || p.categorySlug === selectedCategory) {
        brands.add(p.brand);
      }
    });
    return Array.from(brands);
  }, [selectedCategory]);

  const handleToggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handlePriceChange = (min: number, max: number) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedBrands([]);
    setIsPrimeOnly(false);
    setMinRating(null);
    setMinPrice(0);
    setMaxPrice(500000);
    setSortBy('featured');
    router.push('/products');
  };

  // Filter & Sort Pipeline
  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((product) => {
        // Category filter
        if (selectedCategory !== 'all' && product.categorySlug !== selectedCategory) {
          return false;
        }
        // Keyword filter
        if (
          urlKeyword &&
          !product.title.toLowerCase().includes(urlKeyword.toLowerCase()) &&
          !product.brand.toLowerCase().includes(urlKeyword.toLowerCase()) &&
          !product.tags.some((t) => t.toLowerCase().includes(urlKeyword.toLowerCase()))
        ) {
          return false;
        }
        // Prime filter
        if (isPrimeOnly && !product.isPrimeEligible) {
          return false;
        }
        // Brand filter
        if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
          return false;
        }
        // Rating filter
        if (minRating !== null && product.rating < minRating) {
          return false;
        }
        // Price filter
        if (product.price < minPrice || product.price > maxPrice) {
          return false;
        }
        // Deal filter
        if (urlDeal && !product.isLightningDeal) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price_asc':
            return a.price - b.price;
          case 'price_desc':
            return b.price - a.price;
          case 'rating_desc':
            return b.rating - a.rating;
          case 'newest':
            return (b.createdAt || '').localeCompare(a.createdAt || '');
          default:
            return 0; // featured
        }
      });
  }, [
    selectedCategory,
    urlKeyword,
    isPrimeOnly,
    selectedBrands,
    minRating,
    minPrice,
    maxPrice,
    urlDeal,
    sortBy,
  ]);

  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 py-6 animate-fade-in text-xs">
      {/* Top Header & Breadcrumbs */}
      <div className="bg-white dark:bg-[#131926] p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-gray-500 dark:text-gray-400">
            Showing <strong className="text-gray-900 dark:text-white">{filteredProducts.length}</strong> results
            {urlKeyword && <span> for <strong className="text-amazon-orange">&ldquo;{urlKeyword}&rdquo;</strong></span>}
            {selectedCategory !== 'all' && (
              <span> in <strong className="text-amazon-navy dark:text-blue-400 capitalize">{selectedCategory.replace('-', ' ')}</strong></span>
            )}
          </span>
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md font-bold text-gray-800 dark:text-gray-200"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md font-semibold text-gray-900 dark:text-white cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Avg. Customer Review</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex items-start gap-6">
        {/* Desktop Sidebar (Left) */}
        <div className="w-64 flex-shrink-0 hidden md:block">
          <FacetSidebar
            categories={initialCategories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedBrands={selectedBrands}
            onToggleBrand={handleToggleBrand}
            availableBrands={availableBrands}
            isPrimeOnly={isPrimeOnly}
            onTogglePrime={setIsPrimeOnly}
            minRating={minRating}
            onSelectMinRating={setMinRating}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onPriceChange={handlePriceChange}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* Product Grid */}
        <div className="flex-1 w-full">
          {filteredProducts.length === 0 ? (
            <div className="bg-white dark:bg-[#131926] p-12 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center space-y-4">
              <span className="text-3xl">🔍</span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">No matching products found</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                We couldn&apos;t find any items matching your selected filters. Try broadening your criteria or resetting filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2 bg-amazon-btn-yellow hover:bg-amazon-btn-yellow-hover text-amazon-dark-text font-bold text-xs rounded-md shadow-sm transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-12 space-y-3">
          <Loader2 className="w-8 h-8 text-amazon-orange animate-spin" />
          <span className="text-xs text-gray-500 font-semibold">Loading catalog products...</span>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
