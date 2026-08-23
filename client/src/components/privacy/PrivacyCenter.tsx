'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Download, Trash2, Settings, Lock, CheckCircle2, AlertTriangle, Mail } from 'lucide-react';
import { usePrivacy } from '../../context/PrivacyContext';
import { useAuth } from '../../context/AuthContext';
import { maskEmail, maskPhone } from '../../lib/utils';

export const PrivacyCenter: React.FC = () => {
  const { user } = useAuth();
  const { consent, updateConsent, exportPersonalData, anonymizeMyAccount } = usePrivacy();
  const [analytics, setAnalytics] = useState(consent.analytics);
  const [marketing, setMarketing] = useState(consent.marketing);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleSaveConsent = async () => {
    await updateConsent({ analytics, marketing });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleExport = async () => {
    setIsExporting(true);
    await exportPersonalData();
    setIsExporting(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in text-xs text-gray-800">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amazon-navy via-amazon-navy-light to-amazon-prime p-6 sm:p-8 rounded-xl text-white shadow-lg space-y-2">
        <div className="flex items-center gap-2 text-amazon-gold">
          <ShieldCheck className="w-6 h-6" />
          <span className="font-black text-sm uppercase tracking-wider">
            DPDP Act 2023 Governance Hub
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          Your Privacy & Data Rights Center
        </h1>
        <p className="text-gray-200 text-xs sm:text-sm max-w-2xl leading-relaxed">
          In compliance with India&apos;s <strong>Digital Personal Data Protection (DPDP) Act 2023</strong>, you have complete control over how your personal data is collected, processed, downloaded, or permanently erased.
        </p>
      </div>

      {/* Grid: 3 Main Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Right to Access / Export Data */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between space-y-4 hover:shadow-md transition">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-amazon-prime flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-gray-900">
              Right to Access (Section 11)
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Download a complete machine-readable JSON dossier containing your profile, saved addresses, order history, reviews, and consent logs.
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full py-2.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg font-bold text-gray-800 shadow-sm flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-amazon-prime" />
            <span>{isExporting ? 'Exporting...' : 'Export My Personal Data'}</span>
          </button>
        </div>

        {/* Card 2: Right to Correction & Profile */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between space-y-4 hover:shadow-md transition">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-green-50 text-green-700 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-gray-900">
              Right to Correction (Section 12)
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Review and update your personal identifiers, delivery addresses, and communications preferences in real time.
            </p>
            {user && (
              <div className="p-2.5 bg-gray-50 rounded border border-gray-200 space-y-1">
                <div>Email: <strong className="text-gray-900">{maskEmail(user.email)}</strong></div>
                <div>Phone: <strong className="text-gray-900">{maskPhone(user.phone)}</strong></div>
              </div>
            )}
          </div>
          <Link
            href="/profile"
            className="w-full py-2.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg font-bold text-gray-800 text-center shadow-sm block transition"
          >
            Manage Profile & Addresses &rarr;
          </Link>
        </div>

        {/* Card 3: Right to Erasure ("Forget Me") */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between space-y-4 hover:shadow-md transition">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-gray-900">
              Right to Erasure (Section 12)
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Permanently delete and cryptographically scramble your personal identifiable information (PII) across our databases.
            </p>
          </div>
          <button
            onClick={anonymizeMyAccount}
            className="w-full py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-lg font-bold shadow-sm flex items-center justify-center gap-2 transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Request Account Erasure</span>
          </button>
        </div>
      </div>

      {/* Consent Management Section */}
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-200 space-y-6">
        <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
          <Settings className="w-5 h-5 text-amazon-orange" />
          <h2 className="text-base font-bold text-gray-900">
            Manage Granular Consent Preferences
          </h2>
        </div>

        <div className="space-y-4">
          {/* Essential */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
            <div className="space-y-1">
              <span className="font-bold text-gray-900 block">
                1. Strictly Necessary & Essential Data Processing
              </span>
              <p className="text-gray-600 text-xs">
                Required for customer authentication, cart maintenance, order fulfillment, and legal tax compliance.
              </p>
            </div>
            <span className="bg-gray-200 text-gray-700 px-2.5 py-1 rounded text-xs font-bold whitespace-nowrap">
              Always Active
            </span>
          </div>

          {/* Analytics */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition">
            <div className="space-y-1">
              <span className="font-bold text-gray-900 block">
                2. Analytics & Performance Optimization
              </span>
              <p className="text-gray-600 text-xs">
                Allows us to aggregate telemetry metrics to enhance page load performance and fix errors.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amazon-orange" />
            </label>
          </div>

          {/* Marketing */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition">
            <div className="space-y-1">
              <span className="font-bold text-gray-900 block">
                3. Personalized Marketing & Recommendations
              </span>
              <p className="text-gray-600 text-xs">
                Allows personalized product recommendations and lightning deal notification alerts.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amazon-orange" />
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <Link href="/privacy/policy" className="text-amazon-prime hover:underline font-semibold">
            Read Full Data Protection Notice &rarr;
          </Link>
          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-green-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved!</span>
              </span>
            )}
            <button
              onClick={handleSaveConsent}
              className="px-6 py-2.5 bg-amazon-btn-yellow hover:bg-amazon-btn-yellow-hover text-amazon-dark-text font-bold rounded-lg shadow-sm transition"
            >
              Update Preferences
            </button>
          </div>
        </div>
      </div>

      {/* Statutory Grievance Redressal */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="font-bold text-gray-900 text-sm block">
            Statutory Grievance Redressal (Section 13)
          </span>
          <p className="text-gray-600">
            For data protection inquiries or grievance escalations, contact our designated Data Protection Grievance Officer.
          </p>
        </div>
        <a
          href="mailto:grievance-officer@amazon-enterprise.dev"
          className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-300 rounded-md font-semibold text-gray-800 flex items-center gap-2 whitespace-nowrap shadow-sm"
        >
          <Mail className="w-4 h-4 text-amazon-orange" />
          <span>Contact Grievance Officer</span>
        </a>
      </div>
    </div>
  );
};
