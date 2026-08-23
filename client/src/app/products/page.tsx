'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FacetSidebar } from '../../components/filter/FacetSidebar';
import { ProductCard } from '../../components/product/ProductCard';
import { initialProducts, initialCategories } from '../../lib/mockData';
import { Product } from '../../types';
import { Filter, ArrowUpDown } from 'lucide-react';

export default function ProductsPage() {
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
    return initialProducts.filter((product) => {
      // Keyword match
      if (urlKeyword) {
        const query = urlKeyword.toLowerCase();
        const matchesTitle = product.title.toLowerCase().includes(query);
        const matchesBrand = product.brand.toLowerCase().includes(query);
        const matchesTags = product.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesBrand && !matchesTags) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && product.categorySlug !== selectedCategory) {
        return false;
      }

      // Brand filter
      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
        return false;
      }

      // Prime filter
      if (isPrimeOnly && !product.isPrimeEligible) {
        return false;
      }

      // Lightning deals filter
      if (urlDeal && !product.isLightningDeal) {
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

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return b._id.localeCompare(a._id);
      // 'featured' default: Best sellers and Amazon Choice first
      const scoreA = (a.isBestSeller ? 2 : 0) + (a.isAmazonChoice ? 1 : 0) + a.rating;
      const scoreB = (b.isBestSeller ? 2 : 0) + (b.isAmazonChoice ? 1 : 0) + b.rating;
      return scoreB - scoreA;
    });
  }, [
    urlKeyword,
    selectedCategory,
    selectedBrands,
    isPrimeOnly,
    urlDeal,
    minRating,
    minPrice,
    maxPrice,
    sortBy,
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-gray-500">
            Showing {filteredProducts.length} results
            {urlKeyword ? ` for "${urlKeyword}"` : ''}
            {selectedCategory !== 'all' ? ` in ${selectedCategory}` : ''}
          </span>
          <h1 className="text-lg font-bold text-gray-900">
            {selectedCategory !== 'all'
              ? initialCategories.find((c) => c.slug === selectedCategory)?.name
              : urlKeyword
              ? `Results for "${urlKeyword}"`
              : 'All Department Products'}
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md text-xs font-semibold text-gray-800"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 hidden sm:inline">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-md text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-amazon-orange cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Avg. Customer Review</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar + Grid */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Sidebar */}
        <div className={`${isMobileFilterOpen ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0`}>
          <FacetSidebar
            categories={initialCategories}
            selectedCategory={selectedCategory}
            onSelectCategory={(slug) => setSelectedCategory(slug)}
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
            <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center space-y-4">
              <span className="text-3xl">🔍</span>
              <h3 className="text-lg font-bold text-gray-900">No matching products found</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
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
