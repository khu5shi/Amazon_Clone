'use client';

import React, { useState } from 'react';
import { Star, ThumbsUp, CheckCircle, ShieldCheck } from 'lucide-react';
import { Review } from '../../types';
import { RatingStars } from './RatingStars';
import { useAuth } from '../../context/AuthContext';
import { sanitizeText } from '../../lib/utils';
import { apiClient } from '../../lib/api';

interface ReviewListProps {
  productId: string;
  rating: number;
  numReviews: number;
  initialReviews?: Review[];
}

export const ReviewList: React.FC<ReviewListProps> = ({
  productId,
  rating,
  numReviews,
  initialReviews = [],
}) => {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [helpfulClicked, setHelpfulClicked] = useState<Record<string, boolean>>({});

  const distribution = [
    { stars: 5, percentage: 78 },
    { stars: 4, percentage: 14 },
    { stars: 3, percentage: 5 },
    { stars: 2, percentage: 2 },
    { stars: 1, percentage: 1 },
  ];

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !comment.trim()) return;

    const newReview: Review = {
      _id: `rev_${Date.now()}`,
      user: user?._id || 'guest_user',
      userName: user?.name || 'Amazon Customer',
      product: productId,
      rating: formRating,
      title: sanitizeText(title),
      comment: sanitizeText(comment),
      isVerifiedPurchase: true,
      helpfulVotes: 0,
      createdAt: new Date().toISOString(),
    };

    setReviews([newReview, ...reviews]);

    try {
      await apiClient.post(`/products/${productId}/reviews`, {
        rating: formRating,
        title: sanitizeText(title),
        comment: sanitizeText(comment),
      });
    } catch (err: any) {
      // Local state fallback
    }

    setTitle('');
    setComment('');
    setIsFormOpen(false);
  };

  const handleHelpful = (reviewId: string) => {
    if (helpfulClicked[reviewId]) return;
    setHelpfulClicked((prev) => ({ ...prev, [reviewId]: true }));
    setReviews((prev) =>
      prev.map((r) => (r._id === reviewId ? { ...r, helpfulVotes: r.helpfulVotes + 1 } : r))
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-8 my-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Overall Rating Breakdown */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">
            Customer Reviews
          </h3>
          <div className="flex items-center gap-3">
            <RatingStars rating={rating} size="lg" showCount={false} />
            <span className="text-xl font-black text-gray-900">{rating} out of 5</span>
          </div>
          <span className="text-xs text-gray-500 block">
            {numReviews.toLocaleString()} global ratings
          </span>

          {/* Rating Progress Bars */}
          <div className="space-y-2 pt-2">
            {distribution.map((dist) => (
              <div key={dist.stars} className="flex items-center gap-3 text-xs text-amazon-prime">
                <span className="w-12 hover:underline cursor-pointer">{dist.stars} star</span>
                <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className="bg-amazon-gold h-3 rounded-full transition-all duration-500"
                    style={{ width: `${dist.percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right text-gray-500 font-medium">
                  {dist.percentage}%
                </span>
              </div>
            ))}
          </div>

          {/* Write a Review Button */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-bold text-sm text-gray-900">Review this product</h4>
            <p className="text-xs text-gray-600 mb-3">
              Share your thoughts with other customers
            </p>
            <button
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="w-full py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-xs font-bold text-gray-800 shadow-sm transition"
            >
              {isFormOpen ? 'Close Review Form' : 'Write a product review'}
            </button>
          </div>
        </div>

        {/* Right: Reviews List & Submission Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Review Submission Form */}
          {isFormOpen && (
            <form
              onSubmit={handleAddReview}
              className="p-5 bg-gray-50 rounded-lg border border-gray-200 space-y-4 animate-fade-in"
            >
              <h4 className="font-bold text-sm text-gray-900">Create a Review</h4>

              {/* Star selector */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Overall Rating
                </label>
                <div className="flex items-center gap-1 text-amazon-gold">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormRating(star)}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= formRating ? 'fill-amazon-gold text-amazon-gold' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Headline */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Add a headline
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What's most important to know?"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-amazon-orange focus:outline-none"
                />
              </div>

              {/* Written Review */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Add a written review
                </label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you like or dislike? What did you use this product for?"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-amazon-orange focus:outline-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-amazon-btn-yellow hover:bg-amazon-btn-yellow-hover text-amazon-dark-text font-bold text-xs rounded-md shadow-sm transition"
                >
                  Submit Review
                </button>
              </div>
            </form>
          )}

          {/* Customer Reviews Feed */}
          <div className="space-y-6 divide-y divide-gray-100">
            {reviews.length === 0 ? (
              <p className="text-xs text-gray-500 py-4">
                No customer reviews yet. Be the first to review this product!
              </p>
            ) : (
              reviews.map((rev) => (
                <div key={rev._id} className="pt-4 first:pt-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs text-gray-600">
                      {rev.userName[0]}
                    </div>
                    <span className="text-xs font-semibold text-gray-900">{rev.userName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <RatingStars rating={rev.rating} size="sm" showCount={false} />
                    <h5 className="text-xs font-bold text-gray-900">{rev.title}</h5>
                  </div>

                  {rev.isVerifiedPurchase && (
                    <div className="flex items-center gap-1 text-[11px] text-amazon-deal-red font-bold">
                      <CheckCircle className="w-3.5 h-3.5 text-amazon-orange" />
                      <span>Verified Purchase</span>
                    </div>
                  )}

                  <p className="text-xs text-gray-700 leading-relaxed">{rev.comment}</p>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={() => handleHelpful(rev._id)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded border text-[11px] font-semibold transition ${
                        helpfulClicked[rev._id]
                          ? 'border-green-600 bg-green-50 text-green-700'
                          : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>Helpful ({rev.helpfulVotes})</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
