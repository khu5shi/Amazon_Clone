'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Mail, MapPin, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-xs text-gray-800 animate-fade-in leading-relaxed">
      <Link
        href="/privacy"
        className="flex items-center gap-1 text-xs font-semibold text-amazon-prime hover:underline pb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Privacy Center</span>
      </Link>

      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-center gap-2 text-amazon-prime mb-1">
            <ShieldCheck className="w-5 h-5" />
            <span className="font-bold text-xs uppercase tracking-wider">DPDP Act 2023 Compliance</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Digital Personal Data Protection Notice & Policy
          </h1>
          <p className="text-gray-500 text-[11px] mt-1">
            Effective Date: January 1, 2026 | Notice Version: DPDP-2023-V1.0 | Data Fiduciary: Amazon Enterprise Platform Pvt Ltd
          </p>
        </div>

        {/* Section 1 */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            1. Purpose of Data Processing (Section 5 & 6)
          </h2>
          <p className="text-gray-700">
            Amazon Enterprise processes your personal data strictly for defined and lawful purposes:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>User account management and multi-factor authentication.</li>
            <li>Processing e-commerce shopping carts, delivery addresses, and payment settlements.</li>
            <li>Statutory compliance under India&apos;s Goods and Services Tax (GST) and consumer protection laws.</li>
            <li>Fraud prevention and cybersecurity defense.</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            2. Your Rights as a Data Principal (Sections 11 - 14)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-3 bg-gray-50 rounded border border-gray-200">
              <h4 className="font-bold text-gray-900">Right to Access (Section 11)</h4>
              <p className="text-gray-600 text-[11px] mt-1">
                You can download an export of all your processed personal data directly from your profile.
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded border border-gray-200">
              <h4 className="font-bold text-gray-900">Right to Correction & Erasure (Section 12)</h4>
              <p className="text-gray-600 text-[11px] mt-1">
                You have the absolute right to correct inaccurate data or request cryptographic account erasure.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            3. Security Safeguards & Encryption (Section 8)
          </h2>
          <p className="text-gray-700">
            We implement 256-bit TLS encryption in transit, bcrypt salt rounds on passwords, strict Content Security Policy (CSP), anti-CSRF token verification, and NoSQL injection parameter sanitization.
          </p>
        </div>

        {/* Section 4 */}
        <div className="space-y-2 bg-blue-50/60 p-5 rounded-lg border border-blue-200">
          <h2 className="text-sm font-bold text-amazon-navy uppercase tracking-wide">
            4. Statutory Data Protection Grievance Officer (Section 13)
          </h2>
          <p className="text-gray-700">
            If you have any questions or wish to exercise your statutory rights or file a grievance, contact our Grievance Officer:
          </p>
          <div className="space-y-1 text-gray-800 font-medium pt-2">
            <p><strong>Name:</strong> Rahul Sharma</p>
            <p><strong>Designation:</strong> Data Protection Grievance Officer</p>
            <p className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-amazon-orange" />
              <span>Email: grievance-officer@amazon-enterprise.dev</span>
            </p>
            <p className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amazon-orange" />
              <span>Address: Amazon Enterprise Tower, DLF Cyber City, Phase 2, Gurugram, Haryana - 122002, India</span>
            </p>
            <p className="text-[11px] text-gray-500">Response SLA: Within 7 business days</p>
          </div>
        </div>
      </div>
    </div>
  );
}
