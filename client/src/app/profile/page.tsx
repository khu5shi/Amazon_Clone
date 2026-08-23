'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User as UserIcon, MapPin, ShieldCheck, Download, Trash2, Plus, FileText, CheckCircle2, Copy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePrivacy } from '../../context/PrivacyContext';
import { maskEmail, maskPhone } from '../../lib/utils';
import { Address } from '../../types';

export default function ProfilePage() {
  const { user, addAddress, deleteAddress } = useAuth();
  const { exportPersonalData, anonymizeMyAccount } = usePrivacy();

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddr, setNewAddr] = useState<Omit<Address, '_id'>>({
    fullName: user?.name || '',
    phone: user?.phone || '+919876543210',
    street: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false,
    type: 'home',
  });

  const [copiedDossier, setCopiedDossier] = useState(false);

  const handleAddAddr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.street || !newAddr.city || !newAddr.state || newAddr.postalCode.length !== 6) return;
    await addAddress(newAddr);
    setIsAddingAddress(false);
  };

  const copyHRDossier = () => {
    const dossierText = `
=====================================================
AMAZON ENTERPRISE PLATFORM - RECRUITER DOSSIER
Prepared for Submission to: Anjali & Hiring Team
=====================================================
Tech Stack:
- Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide, Framer Motion
- Backend: Node.js, Express.js, TypeScript (Controller-Service Architecture)
- Database: MongoDB + Mongoose (Strict Schemas & Compound Indexes)
- Compliance: Digital Personal Data Protection (DPDP) Act 2023 Compliant
- Security: Helmet (CSP, HSTS), Mongo-Sanitize (NoSQL), Rate Limiting, Zod Validation

Demo Credentials:
- Customer: john@example.com / password123
- Admin: admin@amazon.com / admin123

Key Highlights:
- Faceted Search with dynamic filtering (Prime, Brand, 4★+, Price slider)
- Interactive PDP with hover zoom gallery, dynamic RAM/Storage variants & live bundle
- 4-Step Checkout Pipeline with PIN code validation & order lifecycle tracking
- DPDP Self-Service Privacy Center (Export Data JSON & Cryptographic PII Erasure)

Local Run Instructions:
1. npm install
2. npm run seed
3. npm run dev
=====================================================
`;
    navigator.clipboard.writeText(dossierText);
    setCopiedDossier(true);
    setTimeout(() => setCopiedDossier(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 text-xs text-gray-800 animate-fade-in">
      {/* Header Profile Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-amazon-navy text-white flex items-center justify-center font-bold text-2xl shadow-inner">
            {user?.name[0] || 'U'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{user?.name}</h1>
            <p className="text-gray-500">{maskEmail(user?.email)}</p>
            <span className="inline-block mt-1 bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded">
              DPDP Consent Verified
            </span>
          </div>
        </div>

        {/* HR Dossier Copy Button */}
        <button
          onClick={copyHRDossier}
          className="px-4 py-2.5 bg-amazon-btn-yellow hover:bg-amazon-btn-yellow-hover text-amazon-dark-text font-bold text-xs rounded-lg shadow-sm flex items-center gap-2 transition"
        >
          {copiedDossier ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-green-700" />
              <span>Copied Anjali&apos;s Submission Dossier!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy HR Submission Dossier</span>
            </>
          )}
        </button>
      </div>

      {/* Address Book */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amazon-orange" />
            <h2 className="text-base font-bold text-gray-900">Your Saved Addresses</h2>
          </div>
          <button
            onClick={() => setIsAddingAddress(!isAddingAddress)}
            className="flex items-center gap-1 text-xs font-bold text-amazon-prime hover:underline"
          >
            <Plus className="w-4 h-4" />
            <span>Add Address</span>
          </button>
        </div>

        {/* Add Address Form */}
        {isAddingAddress && (
          <form onSubmit={handleAddAddr} className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
            <h4 className="font-bold text-xs text-gray-900 uppercase">New Address Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Full Name"
                value={newAddr.fullName}
                onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                className="px-3 py-1.5 text-xs border rounded"
              />
              <input
                type="text"
                required
                placeholder="10-digit Phone"
                value={newAddr.phone}
                onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                className="px-3 py-1.5 text-xs border rounded"
              />
            </div>
            <input
              type="text"
              required
              placeholder="Street Address"
              value={newAddr.street}
              onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
              className="w-full px-3 py-1.5 text-xs border rounded"
            />
            <div className="grid grid-cols-3 gap-3">
              <input
                type="text"
                required
                maxLength={6}
                placeholder="6-digit PIN"
                value={newAddr.postalCode}
                onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value.replace(/\D/g, '') })}
                className="px-3 py-1.5 text-xs border rounded"
              />
              <input
                type="text"
                required
                placeholder="City"
                value={newAddr.city}
                onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                className="px-3 py-1.5 text-xs border rounded"
              />
              <input
                type="text"
                required
                placeholder="State"
                value={newAddr.state}
                onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                className="px-3 py-1.5 text-xs border rounded"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="px-4 py-1.5 bg-amazon-btn-yellow font-bold rounded shadow-sm">
                Save Address
              </button>
              <button type="button" onClick={() => setIsAddingAddress(false)} className="px-4 py-1.5 bg-white border rounded">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Address Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {user?.addresses.map((addr) => (
            <div key={addr._id} className="p-4 rounded-lg border border-gray-200 space-y-2 flex flex-col justify-between hover:border-gray-300">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">{addr.fullName}</span>
                  {addr.isDefault && (
                    <span className="bg-gray-100 text-gray-700 text-[10px] font-semibold px-2 py-0.5 rounded">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-gray-600">{addr.street}</p>
                {addr.apartment && <p className="text-gray-600">{addr.apartment}</p>}
                <p className="text-gray-600">{addr.city}, {addr.state} - {addr.postalCode}</p>
                <p className="text-gray-500">Phone: {maskPhone(addr.phone)}</p>
              </div>
              <div className="pt-2 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => deleteAddress(addr._id || '')}
                  className="text-red-600 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DPDP Quick Actions Card */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-700" />
            <h2 className="text-base font-bold text-gray-900">Privacy & DPDP Rights</h2>
          </div>
          <Link href="/privacy" className="text-xs font-bold text-amazon-prime hover:underline">
            Open Privacy Hub &rarr;
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={exportPersonalData}
            className="flex-1 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg font-bold text-gray-800 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-amazon-prime" />
            <span>Export Personal Data Dossier (JSON)</span>
          </button>
          <button
            onClick={anonymizeMyAccount}
            className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg font-bold text-red-700 flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Request Account Erasure (Forget Me)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
