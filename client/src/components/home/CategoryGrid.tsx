'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { initialProducts, initialCategories } from '../../lib/mockData';
import { formatINR } from '../../lib/utils';

export const CategoryGrid: React.FC = () => {
  const cards = [
    {
      title: 'Flagship Smartphones | 5G',
      link: '/products?category=mobiles-tablets',
      linkText: 'See all mobiles',
      items: [
        {
          name: 'iPhone 15 Pro',
          image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&auto=format&fit=crop&q=80',
          sub: 'Titanium build',
        },
        {
          name: 'Galaxy S24 Ultra',
          image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&auto=format&fit=crop&q=80',
          sub: 'Galaxy AI inside',
        },
        {
          name: 'OnePlus 12',
          image: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400&auto=format&fit=crop&q=80',
          sub: '100W Fast Charge',
        },
        {
          name: 'Smartphones',
          image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80',
          sub: 'Up to 30% off',
        },
      ],
    },
    {
      title: 'High Performance Laptops',
      link: '/products?category=laptops-computers',
      linkText: 'Explore computers',
      items: [
        {
          name: 'MacBook Pro M3',
          image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&auto=format&fit=crop&q=80',
          sub: 'For Creators',
        },
        {
          name: 'Dell XPS OLED',
          image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&auto=format&fit=crop&q=80',
          sub: 'Intel Core i9',
        },
        {
          name: 'Gaming Rigs',
          image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&auto=format&fit=crop&q=80',
          sub: 'RTX 40 Series',
        },
        {
          name: 'Workstations',
          image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&auto=format&fit=crop&q=80',
          sub: 'Up to 25% off',
        },
      ],
    },
    {
      title: 'Audio & ANC Headphones',
      link: '/products?category=audio-headphones',
      linkText: 'Discover audio',
      items: [
        {
          name: 'Sony WH-1000XM5',
          image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&auto=format&fit=crop&q=80',
          sub: 'Top ANC',
        },
        {
          name: 'AirPods Pro 2',
          image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&auto=format&fit=crop&q=80',
          sub: 'USB-C Case',
        },
        {
          name: 'Studio Monitors',
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80',
          sub: 'Hi-Res certified',
        },
        {
          name: 'Soundbars',
          image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&auto=format&fit=crop&q=80',
          sub: 'Dolby Atmos',
        },
      ],
    },
    {
      title: 'Trending Home & Lifestyle',
      link: '/products?category=home-kitchen',
      linkText: 'Shop home appliances',
      items: [
        {
          name: 'Air Fryers',
          image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400&auto=format&fit=crop&q=80',
          sub: 'Healthy cooking',
        },
        {
          name: 'Apple Watch Ultra',
          image: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?w=400&auto=format&fit=crop&q=80',
          sub: 'Titanium GPS',
        },
        {
          name: "Levi's Denim",
          image: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=400&auto=format&fit=crop&q=80',
          sub: '40% off',
        },
        {
          name: 'Kitchen Tech',
          image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&auto=format&fit=crop&q=80',
          sub: 'Prime 1-Day Delivery',
        },
      ],
    },
  ];

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 -mt-16 sm:-mt-32 lg:-mt-48 z-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white p-5 rounded-lg shadow-md border border-gray-200 flex flex-col justify-between hover:shadow-lg transition"
          >
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-3 tracking-tight">
                {card.title}
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {card.items.map((item, itemIdx) => (
                  <Link
                    key={itemIdx}
                    href={card.link}
                    className="group flex flex-col items-center text-center"
                  >
                    <div className="relative w-full h-24 sm:h-28 bg-gray-50 rounded-md overflow-hidden p-1 border border-gray-100 group-hover:border-amazon-orange transition">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain group-hover:scale-105 transition duration-300"
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-800 mt-1 line-clamp-1 group-hover:text-amazon-orange">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-gray-500">{item.sub}</span>
                  </Link>
                ))}
              </div>
            </div>
            <Link
              href={card.link}
              className="text-xs font-bold text-amazon-prime hover:text-amazon-prime-hover hover:underline inline-block pt-2"
            >
              {card.linkText} &rarr;
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
