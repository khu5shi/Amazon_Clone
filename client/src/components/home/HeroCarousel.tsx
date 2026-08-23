'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Sparkles, Flame } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: 'Apple iPhone 15 Pro',
    subtitle: 'Titanium. So strong. So light. So Pro.',
    tag: 'Flagship Deal',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1600&auto=format&fit=crop&q=80',
    link: '/products/apple-iphone-15-pro-128gb-natural-titanium',
    cta: 'Shop Now',
    badgeColor: 'bg-amazon-deal-red',
  },
  {
    id: 2,
    title: 'MacBook Pro 16" M3 Max',
    subtitle: 'Mind-blowing performance. Up to 22 hours of battery life.',
    tag: 'Pro Performance',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1600&auto=format&fit=crop&q=80',
    link: '/products/apple-macbook-pro-16-m3-max-space-black',
    cta: 'Explore Pro',
    badgeColor: 'bg-blue-600',
  },
  {
    id: 3,
    title: 'Sony WH-1000XM5',
    subtitle: 'Industry-Leading Noise Cancellation with LDAC Hi-Res Audio.',
    tag: 'Deal of the Day',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop&q=80',
    link: '/products/sony-wh-1000xm5-wireless-headphones-silver',
    cta: 'Save ₹5,000',
    badgeColor: 'bg-amazon-orange',
  },
];

export const HeroCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const slide = slides[currentSlide];

  return (
    <div className="relative w-full h-[320px] sm:h-[440px] lg:h-[520px] overflow-hidden bg-amazon-navy">
      {/* Background Image with Gradient Mask */}
      <div className="absolute inset-0 transition-opacity duration-700">
        <Image
          src={slide.image}
          alt={slide.title}
          fill
          priority
          className="object-cover object-center opacity-60 mix-blend-luminosity"
        />
        {/* Amazon Signature Bottom Gradient Blend */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#eaeded]" />
      </div>

      {/* Content Overlay */}
      <div className="relative max-w-7xl mx-auto h-full px-6 sm:px-12 flex flex-col justify-center space-y-3 z-10">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-white w-fit ${slide.badgeColor}`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>{slide.tag}</span>
        </span>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight max-w-2xl drop-shadow-md">
          {slide.title}
        </h1>

        <p className="text-sm sm:text-base text-gray-200 font-medium max-w-xl drop-shadow">
          {slide.subtitle}
        </p>

        <div className="pt-2">
          <Link
            href={slide.link}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amazon-btn-yellow hover:bg-amazon-btn-yellow-hover text-amazon-dark-text text-xs sm:text-sm font-bold rounded-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5"
          >
            <span>{slide.cta}</span>
            <Sparkles className="w-4 h-4 text-amazon-dark-text" />
          </Link>
        </div>
      </div>

      {/* Prev / Next Arrows */}
      <button
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-r-md bg-black/30 hover:bg-black/60 text-white transition z-20 focus:outline-none"
      >
        <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next Slide"
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-l-md bg-black/30 hover:bg-black/60 text-white transition z-20 focus:outline-none"
      >
        <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-16 sm:bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              currentSlide === idx ? 'bg-amazon-orange w-8' : 'bg-white/50 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
