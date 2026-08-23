'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Settings, Check, X } from 'lucide-react';
import { usePrivacy } from '../../context/PrivacyContext';

export const PrivacyBanner: React.FC = () => {
  const { isBannerOpen, acceptAll, rejectOptional, updateConsent, consent } = usePrivacy();
  const [showPreferences, setShowPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(consent.analytics);
  const [marketing, setMarketing] = useState(consent.marketing);

  if (!isBannerOpen) return null;

  const handleSaveCustom = async () => {
    await updateConsent({ analytics, marketing });
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-amazon-navy/95 backdrop-blur-md text-white border-t border-amazon-orange shadow-2xl p-4 sm:p-5 animate-fade-in">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Info Text */}
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amazon-gold" />
            <h4 className="text-sm font-bold tracking-wide">
              DPDP Act 2023 Compliance & Privacy Notice
            </h4>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            In compliance with India&apos;s <strong>Digital Personal Data Protection (DPDP) Act 2023</strong>, Amazon Enterprise processes your personal data strictly for authentication, order fulfillment, and seamless service delivery. You retain complete rights to access, download, or erase your data at any time.
          </p>
          <div className="flex gap-4 pt-0.5 text-xs text-amazon-gold">
            <Link href="/privacy" className="hover:underline">
              Privacy Center & Data Rights &rarr;
            </Link>
            <Link href="/privacy/policy" className="hover:underline">
              Data Protection Notice & Grievance Officer &rarr;
            </Link>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {!showPreferences ? (
            <>
              <button
                onClick={() => setShowPreferences(true)}
                className="px-3.5 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 border border-gray-500 rounded-md transition flex items-center gap-1.5"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Customize</span>
              </button>
              <button
                onClick={rejectOptional}
                className="px-4 py-2 text-xs font-semibold bg-gray-700 hover:bg-gray-600 rounded-md transition"
              >
                Essential Only
              </button>
              <button
                onClick={acceptAll}
                className="px-5 py-2 text-xs font-bold bg-amazon-btn-yellow hover:bg-amazon-btn-yellow-hover text-amazon-dark-text rounded-md shadow transition"
              >
                Accept All
              </button>
            </>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/10 w-full">
              <label className="flex items-center gap-2 text-xs text-gray-300">
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="rounded text-amazon-orange focus:ring-amazon-orange cursor-not-allowed"
                />
                <span>Essential (Required)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="rounded text-amazon-orange focus:ring-amazon-orange"
                />
                <span>Analytics</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="rounded text-amazon-orange focus:ring-amazon-orange"
                />
                <span>Marketing</span>
              </label>

              <button
                onClick={handleSaveCustom}
                className="px-4 py-1.5 bg-amazon-btn-yellow hover:bg-amazon-btn-yellow-hover text-amazon-dark-text text-xs font-bold rounded shadow transition ml-auto"
              >
                Save Preferences
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
