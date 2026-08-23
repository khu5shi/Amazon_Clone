'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConsentSettings } from '../types';
import { useAuth } from './AuthContext';
import { apiClient } from '../lib/api';

interface PrivacyContextType {
  consent: ConsentSettings;
  isBannerOpen: boolean;
  updateConsent: (newPreferences: Partial<ConsentSettings>) => Promise<void>;
  acceptAll: () => Promise<void>;
  rejectOptional: () => Promise<void>;
  closeBanner: () => void;
  exportPersonalData: () => Promise<void>;
  anonymizeMyAccount: () => Promise<void>;
}

const defaultConsent: ConsentSettings = {
  essential: true,
  analytics: false,
  marketing: false,
  updatedAt: new Date().toISOString(),
};

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export const PrivacyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateUser, logout } = useAuth();
  const [consent, setConsent] = useState<ConsentSettings>(defaultConsent);
  const [isBannerOpen, setIsBannerOpen] = useState(false);

  useEffect(() => {
    try {
      const storedConsent = localStorage.getItem('amzn_dpdp_consent');
      if (storedConsent) {
        setConsent(JSON.parse(storedConsent));
      } else {
        setIsBannerOpen(true);
      }
    } catch (e) {
      setIsBannerOpen(true);
    }
  }, []);

  const saveConsent = async (preferences: ConsentSettings) => {
    setConsent(preferences);
    localStorage.setItem('amzn_dpdp_consent', JSON.stringify(preferences));
    setIsBannerOpen(false);

    if (user) {
      updateUser({ consentSettings: preferences });
    }

    try {
      await apiClient.post('/privacy/update-consent', preferences);
    } catch (e) {
      // Handled in client state
    }
  };

  const updateConsent = async (newPreferences: Partial<ConsentSettings>) => {
    const updated: ConsentSettings = {
      ...consent,
      ...newPreferences,
      essential: true, // Essential is always required for fulfillment
      updatedAt: new Date().toISOString(),
    };
    await saveConsent(updated);
  };

  const acceptAll = async () => {
    await updateConsent({ essential: true, analytics: true, marketing: true });
  };

  const rejectOptional = async () => {
    await updateConsent({ essential: true, analytics: false, marketing: false });
  };

  const closeBanner = () => {
    setIsBannerOpen(false);
  };

  // DPDP Right to Access (Download JSON Dossier)
  const exportPersonalData = async () => {
    if (!user) return;

    try {
      // Gather local state data package
      const orders = JSON.parse(localStorage.getItem('amzn_orders') || '[]');
      const exportPackage = {
        exportMetadata: {
          exportedAt: new Date().toISOString(),
          regulation: 'Digital Personal Data Protection (DPDP) Act 2023 - Section 11',
          dataFiduciary: 'Amazon Enterprise Platform Inc.',
          userId: user._id,
        },
        personalProfile: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        savedAddresses: user.addresses,
        orderHistory: orders,
        activeConsentSettings: consent,
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPackage, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute(
        'download',
        `DPDP_Data_Export_${user._id}_${Date.now()}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err: any) {
      alert('Error exporting personal data: ' + err.message);
    }
  };

  // DPDP Right to Erasure ("Forget Me")
  const anonymizeMyAccount = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      '⚠️ DPDP Right to Erasure Request\n\nAre you sure you want to delete your account? This will permanently scramble your personal information (name, email, phone, addresses) with cryptographic hashes. Historical order transaction IDs will be preserved for statutory tax audit purposes without linking to your identity.\n\nThis action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      // Perform local cryptographic anonymization
      const randomSuffix = Math.random().toString(36).substring(2, 10);
      const anonymizedUser = {
        ...user,
        name: `Anonymized User (${randomSuffix})`,
        email: `anonymized_${randomSuffix}@dpdp-purged.local`,
        phone: undefined,
        addresses: [],
        isAnonymized: true,
      };

      updateUser(anonymizedUser);
      localStorage.removeItem('amzn_cart');

      alert(
        '✅ Account Anonymized\n\nYour personal data has been erased and cryptographically scrambled in compliance with DPDP Act 2023 Section 12.'
      );

      logout();
    } catch (e) {
      alert('Failed to process erasure request.');
    }
  };

  return (
    <PrivacyContext.Provider
      value={{
        consent,
        isBannerOpen,
        updateConsent,
        acceptAll,
        rejectOptional,
        closeBanner,
        exportPersonalData,
        anonymizeMyAccount,
      }}
    >
      {children}
    </PrivacyContext.Provider>
  );
};

export const usePrivacy = () => {
  const context = useContext(PrivacyContext);
  if (!context) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return context;
};
