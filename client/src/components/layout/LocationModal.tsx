'use client';

import React, { useState } from 'react';
import { MapPin, X, Navigation, Search, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { osmService, OSMAddressResult } from '../../lib/osmService';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect?: (location: OSMAddressResult) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  onLocationSelect,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<OSMAddressResult[]>([]);
  const [pinCode, setPinCode] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    user?.addresses.find((a) => a.isDefault)?._id || ''
  );

  const [isDetecting, setIsDetecting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<OSMAddressResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Handle OSM Live GPS Detection
  const handleDetectGPS = async () => {
    setIsDetecting(true);
    setErrorMsg('');
    try {
      const loc = await osmService.detectCurrentLocation();
      setDetectedLocation(loc);
      setPinCode(loc.postalCode);
      if (onLocationSelect) {
        onLocationSelect(loc);
      }
      localStorage.setItem('amzn_user_location', JSON.stringify(loc));
      toast.success('Location Detected via GPS', `${loc.street || loc.city}, ${loc.postalCode}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to detect location.');
      toast.error('Location Error', err.message || 'Could not detect location');
    } finally {
      setIsDetecting(false);
    }
  };

  // Handle OSM Live Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || searchQuery.trim().length < 3) return;

    setIsSearching(true);
    setErrorMsg('');
    try {
      const results = await osmService.searchAddress(searchQuery);
      setSearchResults(results);
      if (results.length === 0) {
        setErrorMsg('No matching addresses found in India.');
      }
    } catch (err: any) {
      setErrorMsg('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLocation = (loc: OSMAddressResult) => {
    setDetectedLocation(loc);
    setPinCode(loc.postalCode);
    if (onLocationSelect) {
      onLocationSelect(loc);
    }
    localStorage.setItem('amzn_user_location', JSON.stringify(loc));
    onClose();
  };

  const handleApplyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinCode.length === 6) {
      const customLoc: OSMAddressResult = {
        formattedAddress: `PIN ${pinCode}, India`,
        street: 'PIN Code Area',
        city: `PIN ${pinCode}`,
        state: 'India',
        postalCode: pinCode,
        country: 'India',
        lat: 28.4595,
        lon: 77.0266,
      };
      handleSelectLocation(customLoc);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in text-xs">
      <div className="bg-white dark:bg-[#131926] rounded-lg shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="bg-[#f0f2f2] dark:bg-gray-800 px-6 py-4 border-b border-gray-300 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold text-base">
            <MapPin className="w-5 h-5 text-amazon-orange" />
            <span>Choose your delivery location</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 dark:hover:text-white p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* GPS Auto-Detect Button */}
          <button
            onClick={handleDetectGPS}
            disabled={isDetecting}
            className="w-full py-3 px-4 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 border border-amazon-orange/50 rounded-lg text-amazon-navy dark:text-orange-300 font-bold flex items-center justify-center gap-2 shadow-sm transition"
          >
            {isDetecting ? (
              <>
                <Loader2 className="w-4 h-4 text-amazon-orange animate-spin" />
                <span>Detecting location via OpenStreetMap GPS...</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 text-amazon-orange fill-amazon-orange/20" />
                <span>📍 Auto-detect My Current Location (OpenStreetMap)</span>
              </>
            )}
          </button>

          {detectedLocation && (
            <div className="p-3 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-2 text-green-800 dark:text-green-300">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">GPS Location Detected:</span>
                <p className="text-[11px] font-medium">{detectedLocation.formattedAddress}</p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 rounded text-[11px] font-semibold">
              {errorMsg}
            </div>
          )}

          {/* OSM Address Search Input */}
          <div className="space-y-2 pt-1">
            <span className="font-bold text-gray-700 dark:text-gray-300 block uppercase tracking-wider text-[11px]">
              Search any City, Area or Landmark (OpenStreetMap)
            </span>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Cyber City Gurugram, HSR Layout, Mumbai..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amazon-orange"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="px-4 py-2 bg-white dark:bg-gray-700 hover:bg-gray-100 border border-gray-300 dark:border-gray-600 rounded-md font-bold text-gray-800 dark:text-white shadow-sm flex items-center gap-1"
              >
                {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Search</span>
              </button>
            </form>

            {/* Search Results List */}
            {searchResults.length > 0 && (
              <div className="space-y-1.5 pt-2 max-h-40 overflow-y-auto border-t border-gray-200 dark:border-gray-700">
                {searchResults.map((res, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectLocation(res)}
                    className="w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-amazon-orange transition flex items-start gap-2"
                  >
                    <MapPin className="w-3.5 h-3.5 text-amazon-orange flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white block line-clamp-1">{res.street || res.city}</span>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1">{res.formattedAddress}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Saved Addresses List */}
          {user && user.addresses.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="font-bold text-gray-700 dark:text-gray-300 block uppercase tracking-wider text-[11px]">
                Your Saved Addresses
              </span>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {user.addresses.map((addr) => (
                  <label
                    key={addr._id}
                    onClick={() => setSelectedAddressId(addr._id || '')}
                    className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition ${
                      selectedAddressId === addr._id
                        ? 'border-amazon-orange bg-orange-50/50 dark:bg-orange-950/30'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="selected_addr"
                      checked={selectedAddressId === addr._id}
                      onChange={() => setSelectedAddressId(addr._id || '')}
                      className="mt-1 text-amazon-orange focus:ring-amazon-orange"
                    />
                    <div className="text-gray-800 dark:text-gray-200">
                      <span className="font-bold block">{addr.fullName}</span>
                      <p className="text-gray-600 dark:text-gray-400 text-[11px]">{addr.street}, {addr.city} - {addr.postalCode}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Custom Indian PIN Code */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="font-bold text-gray-700 dark:text-gray-300 block uppercase tracking-wider text-[11px] mb-1.5">
              Enter Indian PIN code
            </span>
            <form onSubmit={handleApplyPin} className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                placeholder="6-digit PIN code"
                className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-white dark:bg-gray-700 hover:bg-gray-100 border border-gray-300 dark:border-gray-600 rounded font-semibold text-gray-800 dark:text-white shadow-sm"
              >
                Apply PIN
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#f0f2f2] dark:bg-gray-800 px-6 py-3 border-t border-gray-300 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amazon-btn-yellow hover:bg-amazon-btn-yellow-hover text-amazon-dark-text rounded-md font-bold shadow-sm transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
