'use client';

import React, { useRef, useEffect } from 'react';

interface OTPInputProps {
  value: string;
  onChange: (otp: string) => void;
  length?: number;
  disabled?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  value,
  onChange,
  length = 6,
  disabled = false,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    if (!rawVal) return;

    const char = rawVal[rawVal.length - 1];
    const otpArr = value.split('');
    otpArr[idx] = char;
    const newOtp = otpArr.join('').slice(0, length);
    onChange(newOtp);

    // Advance to next box if not last
    if (idx < length - 1 && inputRefs.current[idx + 1]) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Backspace') {
      if (!value[idx] && idx > 0 && inputRefs.current[idx - 1]) {
        // Move to previous box on backspace
        inputRefs.current[idx - 1]?.focus();
      } else {
        const otpArr = value.split('');
        otpArr[idx] = '';
        onChange(otpArr.join(''));
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    } else if (e.key === 'ArrowRight' && idx < length - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (pasted) {
      onChange(pasted);
      const targetIdx = Math.min(pasted.length, length - 1);
      inputRefs.current[targetIdx]?.focus();
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 py-2">
      {[...Array(length)].map((_, idx) => (
        <input
          key={idx}
          ref={(el) => {
            inputRefs.current[idx] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          disabled={disabled}
          value={value[idx] || ''}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onPaste={handlePaste}
          className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black font-mono bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-amazon-orange dark:focus:border-amazon-orange focus:ring-2 focus:ring-amazon-orange/30 outline-none transition shadow-sm text-gray-900 dark:text-white"
        />
      ))}
    </div>
  );
};
