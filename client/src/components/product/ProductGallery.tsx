'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, title }) => {
  const [selectedImage, setSelectedImage] = useState(images[0] || '');
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4 items-start">
      {/* Thumbnail column */}
      <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto max-h-[480px] p-1">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedImage(img)}
            onMouseEnter={() => setSelectedImage(img)}
            className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-md bg-white border-2 p-1 overflow-hidden transition flex-shrink-0 ${
              selectedImage === img
                ? 'border-amazon-orange shadow-md'
                : 'border-gray-200 hover:border-gray-400'
            }`}
          >
            <Image src={img} alt={`${title} thumb ${idx}`} fill className="object-contain p-0.5" />
          </button>
        ))}
      </div>

      {/* Main Image with Zoom on Hover */}
      <div
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
        className="relative w-full h-80 sm:h-96 md:h-[460px] bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-center overflow-hidden cursor-crosshair shadow-sm"
      >
        <Image
          src={selectedImage || images[0]}
          alt={title}
          fill
          priority
          className={`object-contain transition-transform duration-100 ${
            isZoomed ? 'scale-150' : 'scale-100'
          }`}
          style={
            isZoomed
              ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` }
              : undefined
          }
        />
        {!isZoomed && (
          <span className="absolute bottom-2 right-2 text-[10px] text-gray-400 bg-white/80 px-2 py-0.5 rounded shadow">
            Roll over image to zoom in
          </span>
        )}
      </div>
    </div>
  );
};
