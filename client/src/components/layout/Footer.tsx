'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-amazon-navy text-white text-xs mt-12">
      {/* 1. Back to Top Button */}
      <button
        onClick={scrollToTop}
        className="w-full py-3.5 bg-amazon-navy-light hover:bg-[#37475a] text-center font-bold text-gray-200 transition text-xs border-b border-gray-700"
      >
        Back to top
      </button>

      {/* 2. Main Directory Columns */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8">
        <div className="space-y-2.5">
          <h4 className="font-bold text-sm text-white">Get to Know Us</h4>
          <ul className="space-y-1.5 text-gray-300">
            <li><Link href="/" className="hover:underline">About Amazon Enterprise</Link></li>
            <li><Link href="/docs/PRD.md" className="hover:underline">Product Vision & PRD</Link></li>
            <li><Link href="/docs/ARCHITECTURE.md" className="hover:underline">System Architecture</Link></li>
            <li><Link href="/docs/MEMORY.md" className="hover:underline">Engineering Log</Link></li>
          </ul>
        </div>

        <div className="space-y-2.5">
          <h4 className="font-bold text-sm text-white">Connect with Us</h4>
          <ul className="space-y-1.5 text-gray-300">
            <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:underline">GitHub Repository</a></li>
            <li><a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:underline">LinkedIn Profile</a></li>
            <li><Link href="/profile" className="hover:underline">HR Submission Dossier</Link></li>
          </ul>
        </div>

        <div className="space-y-2.5">
          <h4 className="font-bold text-sm text-white">Make Money with Us</h4>
          <ul className="space-y-1.5 text-gray-300">
            <li><Link href="/products" className="hover:underline">Sell on Amazon</Link></li>
            <li><Link href="/products" className="hover:underline">Protect and Build Your Brand</Link></li>
            <li><Link href="/products" className="hover:underline">Fulfillment by Amazon</Link></li>
          </ul>
        </div>

        <div className="space-y-2.5">
          <h4 className="font-bold text-sm text-white">Privacy & DPDP Compliance</h4>
          <ul className="space-y-1.5 text-gray-300">
            <li>
              <Link href="/privacy" className="flex items-center gap-1.5 text-amazon-gold hover:underline font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>DPDP Privacy Center</span>
              </Link>
            </li>
            <li><Link href="/privacy/policy" className="hover:underline">Data Protection Notice</Link></li>
            <li><Link href="/privacy" className="hover:underline">Right to Access / Data Export</Link></li>
            <li><Link href="/privacy" className="hover:underline">Right to Erasure (Forget Me)</Link></li>
          </ul>
        </div>
      </div>

      {/* 3. Grievance Officer & Statutory Notice Bar */}
      <div className="bg-[#11161d] border-t border-gray-800 py-6 px-6 text-center text-gray-400 space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-6 text-[11px]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
            <span>DPDP Act 2023 Compliant Platform</span>
          </span>
          <span className="flex items-center gap-1">
            <Mail className="w-3.5 h-3.5 text-amazon-gold" />
            <span>Grievance Officer: Rahul Sharma (grievance-officer@amazon-enterprise.dev)</span>
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amazon-orange" />
            <span>Cyber Hub, Gurugram, Haryana - 122002</span>
          </span>
        </div>
        <p className="text-[10px] text-gray-500 pt-2">
          &copy; 2026 Amazon Enterprise Platform. Built for senior engineering evaluation. All trademarks and brand assets are used for demonstrative purposes.
        </p>
      </div>
    </footer>
  );
};
