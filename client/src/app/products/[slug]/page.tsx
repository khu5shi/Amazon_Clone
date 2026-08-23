'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProductGallery } from '../../../components/product/ProductGallery';
import { VariantSelector } from '../../../components/product/VariantSelector';
import { FrequentlyBoughtTogether } from '../../../components/product/FrequentlyBoughtTogether';
import { ReviewList } from '../../../components/product/ReviewList';
import { RatingStars } from '../../../components/product/RatingStars';
import { initialProducts } from '../../../lib/mockData';
import { Variant } from '../../../types';
import { useCart } from '../../../context/CartContext';
import { formatINR } from '../../../lib/utils';
import { ShieldCheck, Truck, RotateCcw, Lock, CheckCircle2, ChevronRight, ShoppingCart, Zap } from 'lucide-react';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { addToCart } = useCart();

  // Find product by slug
  const product =
    initialProducts.find((p) => p.slug === params.slug) || initialProducts[0];

  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>(
    product.variants?.[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const relatedProducts = initialProducts.filter(
    (p) => p.categorySlug === product.categorySlug && p._id !== product._id
  );

  const currentPrice = product.price + (selectedVariant?.priceDelta || 0);
  const currentOriginalPrice = product.originalPrice + (selectedVariant?.priceDelta || 0);

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedVariant, quantity);
    router.push('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8 animate-fade-in text-xs text-gray-800">
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center gap-1 text-[11px] text-gray-500 overflow-x-auto pb-1">
        <Link href="/" className="hover:text-amazon-orange">Home</Link>
        <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
        <Link href="/products" className="hover:text-amazon-orange">Products</Link>
        <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
        <Link
          href={`/products?category=${product.categorySlug}`}
          className="hover:text-amazon-orange capitalize whitespace-nowrap"
        >
          {product.categorySlug.replace('-', ' & ')}
        </Link>
        <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
        <span className="text-gray-800 font-semibold truncate max-w-xs">{product.title}</span>
      </nav>

      {/* 2. Main PDP Grid: Gallery | Product Info | Buy Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Gallery Column (5 cols) */}
        <div className="lg:col-span-5 w-full">
          <ProductGallery images={product.images} title={product.title} />
        </div>

        {/* Product Details Column (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div>
            <span className="text-xs font-bold text-amazon-prime uppercase tracking-wider block">
              Brand: {product.brand}
            </span>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug mt-1">
              {product.title}
            </h1>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 pt-1 border-b border-gray-200 pb-3">
            <RatingStars rating={product.rating} numReviews={product.numReviews} size="md" />
            <span className="text-gray-400">|</span>
            <span className="text-xs text-gray-600 font-medium">100+ bought in past month</span>
          </div>

          {/* Pricing & Deals */}
          <div className="space-y-1">
            {product.discountPercentage > 0 && (
              <div className="flex items-center gap-2">
                <span className="bg-amazon-deal-red text-white text-xs font-black px-2 py-0.5 rounded">
                  Limited time deal
                </span>
                <span className="text-amazon-deal-red font-bold text-sm">
                  -{product.discountPercentage}%
                </span>
              </div>
            )}

            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-gray-900">
                {formatINR(currentPrice)}
              </span>
              {currentOriginalPrice > currentPrice && (
                <span className="text-xs text-gray-500 line-through">
                  M.R.P.: {formatINR(currentOriginalPrice)}
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-600">Inclusive of all taxes</p>
          </div>

          {/* Variant Selector */}
          <VariantSelector
            variants={product.variants}
            selectedVariant={selectedVariant}
            onSelectVariant={setSelectedVariant}
            basePrice={product.price}
          />

          {/* Key Features */}
          {product.features && product.features.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wider">
                About this item
              </h3>
              <ul className="list-disc pl-4 space-y-1.5 text-xs text-gray-700 leading-relaxed">
                {product.features.map((feat, i) => (
                  <li key={i}>{feat}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Technical Specifications preview */}
          {product.specifications && (
            <div className="space-y-2 pt-4 border-t border-gray-200">
              <h3 className="font-bold text-xs text-gray-900 uppercase tracking-wider">
                Technical Details
              </h3>
              <table className="w-full text-xs text-left border border-gray-200">
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(product.specifications).map(([key, val]) => (
                    <tr key={key}>
                      <td className="p-2 font-bold text-gray-600 bg-gray-50 w-1/3">{key}</td>
                      <td className="p-2 text-gray-800">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 3. Buy Box Column (3 cols) */}
        <div className="lg:col-span-3 bg-white p-5 rounded-lg border border-gray-300 shadow-sm space-y-4">
          <div className="text-xl font-bold text-amazon-deal-red">
            {formatINR(currentPrice)}
          </div>

          {/* Prime Delivery info */}
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded">
                prime
              </span>
              <span className="font-bold text-gray-900">FREE delivery</span>
            </div>
            <p className="text-gray-600">
              Order within <strong className="text-green-700">3 hrs 15 mins</strong> for delivery by <strong className="text-gray-900">Tomorrow</strong>.
            </p>
          </div>

          {/* Stock availability */}
          <div className="text-sm font-bold text-green-700">In stock</div>
          <span className="text-[11px] text-gray-500 block">
            Ships from: <strong>Amazon</strong> | Sold by: <strong>Appario Retail Pvt Ltd</strong>
          </span>

          {/* Quantity Selector */}
          <div className="flex items-center gap-2 text-xs">
            <label htmlFor="quantity" className="font-semibold text-gray-700">
              Quantity:
            </label>
            <select
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amazon-orange cursor-pointer font-bold"
            >
              {[1, 2, 3, 4, 5].map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleAddToCart}
              className={`w-full py-2.5 rounded-full font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition ${
                isAdded
                  ? 'bg-green-600 text-white'
                  : 'bg-amazon-btn-yellow hover:bg-amazon-btn-yellow-hover text-amazon-dark-text'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{isAdded ? 'Added to Cart!' : 'Add to Cart'}</span>
            </button>

            <button
              onClick={handleBuyNow}
              className="w-full py-2.5 bg-amazon-btn-orange hover:bg-amazon-btn-orange-hover text-amazon-dark-text rounded-full font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition"
            >
              <Zap className="w-4 h-4 fill-amazon-dark-text" />
              <span>Buy Now</span>
            </button>
          </div>

          {/* Security & Warranty trust icons */}
          <div className="space-y-2 pt-4 border-t border-gray-200 text-[11px] text-gray-600">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amazon-prime flex-shrink-0" />
              <span>Secure transaction</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amazon-prime flex-shrink-0" />
              <span>7 days Replacement / Return</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-amazon-prime flex-shrink-0" />
              <span>Amazon Delivered</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span>DPDP Act 2023 Compliant</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Frequently Bought Together */}
      <FrequentlyBoughtTogether
        mainProduct={product}
        relatedProducts={relatedProducts}
      />

      {/* 5. Verified Customer Reviews */}
      <ReviewList
        productId={product._id}
        rating={product.rating}
        numReviews={product.numReviews}
      />
    </div>
  );
}
