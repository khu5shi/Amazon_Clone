'use client';

import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  numReviews?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  numReviews,
  size = 'sm',
  showCount = true,
}) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.4;
  const starSize = size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center text-amazon-gold">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <Star key={i} className={`${starSize} fill-amazon-gold text-amazon-gold`} />;
          }
          if (i === fullStars && hasHalfStar) {
            return <StarHalf key={i} className={`${starSize} fill-amazon-gold text-amazon-gold`} />;
          }
          return <Star key={i} className={`${starSize} text-gray-300`} />;
        })}
      </div>
      {showCount && numReviews !== undefined && (
        <span className="text-xs text-amazon-prime hover:underline font-medium cursor-pointer">
          {numReviews.toLocaleString()}
        </span>
      )}
    </div>
  );
};
