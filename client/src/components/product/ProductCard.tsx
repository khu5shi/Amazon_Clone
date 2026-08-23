'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Check, ShieldCheck } from 'lucide-react';
import { Product } from '../../types';
import { RatingStars } from './RatingStars';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../lib/utils';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product, product.variants?.[0], 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="group bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all p-4 flex flex-col justify-between relative overflow-hidden">
      {/* 1. Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {product.isBestSeller && (
          <span className="bg-[#e67a00] text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm">
            #1 Best Seller
          </span>
        )}
        {product.isAmazonChoice && (
          <span className="bg-amazon-navy text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
            Overall Pick
          </span>
        )}
      </div>

      <div>
        {/* 2. Image */}
        <Link
          href={`/products/${product.slug}`}
          className="relative w-full h-52 block bg-gray-50 rounded-md overflow-hidden p-3 mb-3"
        >
          <Image
            src={product.thumbnail}
            alt={product.title}
            fill
            className="object-contain group-hover:scale-105 transition duration-300"
          />
        </Link>

        {/* 3. Brand & Title */}
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
          {product.brand}
        </span>
        <Link
          href={`/products/${product.slug}`}
          className="text-sm font-semibold text-gray-900 hover:text-amazon-orange line-clamp-2 mt-0.5 leading-snug"
        >
          {product.title}
        </Link>

        {/* 4. Rating */}
        <div className="mt-1.5">
          <RatingStars rating={product.rating} numReviews={product.numReviews} />
        </div>

        {/* 5. Pricing */}
        <div className="mt-2.5 flex items-baseline gap-2 flex-wrap">
          <span className="text-lg font-bold text-gray-900">
            {formatINR(product.price)}
          </span>
          {product.originalPrice > product.price && (
            <>
              <span className="text-xs text-gray-500 line-through">
                {formatINR(product.originalPrice)}
              </span>
              <span className="text-xs font-bold text-amazon-deal-red">
                ({product.discountPercentage}% off)
              </span>
            </>
          )}
        </div>

        {/* 6. Prime badge & Delivery promise */}
        {product.isPrimeEligible && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded">
              prime
            </span>
            <span className="text-xs text-gray-600 font-medium">
              FREE delivery <strong className="text-gray-900">Tomorrow</strong>
            </span>
          </div>
        )}
      </div>

      {/* 7. Action Button */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <button
          onClick={handleAddToCart}
          className={`w-full py-2 rounded-lg font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition ${
            isAdded
              ? 'bg-green-600 text-white'
              : 'bg-amazon-btn-yellow hover:bg-amazon-btn-yellow-hover text-amazon-dark-text'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4" />
              <span>Added to Cart</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
