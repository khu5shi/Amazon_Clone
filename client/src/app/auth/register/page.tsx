'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, AlertCircle, Mail, Clock, RotateCcw, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { OTPInput } from '../../../components/auth/OTPInput';

export default function RegisterPage() {
  const router = useRouter();
  const { sendSignupOTP, verifySignupOTP, resendOTP } = useAuth();

  // Registration step: 1 (Form) -> 2 (Email OTP Verification)
  const [step, setStep] = useState<1 | 2>(1);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [consentEssential, setConsentEssential] = useState(true);
  const [consentAnalytics, setConsentAnalytics] = useState(false);

  // OTP State
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds TTL
  const [isResendActive, setIsResendActive] = useState(false);
  const [smtpPreviewUrl, setSmtpPreviewUrl] = useState<string | undefined>(undefined);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 60-Second Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsResendActive(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  // Step 1: Submit Details & Request 60s OTP
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (!consentEssential) {
      setErrorMsg('Essential consent is mandatory under the DPDP Act 2023.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await sendSignupOTP(email, name);
      setSmtpPreviewUrl(res.previewUrl);
      setSuccessMsg(res.message);
      setTimeLeft(60);
      setIsResendActive(false);
      setStep(2);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send verification email.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify 60s OTP & Complete Registration
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      await verifySignupOTP(email, otp, name, password, phone, {
        essential: true,
        analytics: consentAnalytics,
      });
      router.push('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid or expired OTP code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP handler
  const handleResend = async () => {
    if (!isResendActive) return;
    setIsLoading(true);
    setErrorMsg('');
    setOtp('');
    try {
      const res = await resendOTP(email, 'signup');
      setSmtpPreviewUrl(res.previewUrl);
      setSuccessMsg(res.message);
      setTimeLeft(60);
      setIsResendActive(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-12 text-xs text-gray-800 dark:text-gray-200 animate-fade-in">
      {/* Amazon Logo */}
      <Link href="/" className="mb-6">
        <span className="text-3xl font-black tracking-tight text-amazon-navy dark:text-white">
          amazon<span className="text-amazon-orange text-sm font-bold">.in</span>
        </span>
      </Link>

      {/* Main Card */}
      <div className="bg-white dark:bg-[#131926] p-8 rounded-lg shadow-sm border border-gray-300 dark:border-gray-700 max-w-md w-full space-y-5">
        {step === 1 ? (
          <>
            <h1 className="text-2xl font-normal text-gray-900 dark:text-white">
              Create Account
            </h1>

            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-800 dark:text-gray-300 block mb-1">
                  Your name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="First and last name"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-gray-800 border border-gray-400 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-amazon-orange text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-800 dark:text-gray-300 block mb-1">
                  Email (OTP will be sent here)
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-gray-800 border border-gray-400 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-amazon-orange text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-800 dark:text-gray-300 block mb-1">
                  Mobile number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 10-digit mobile number (optional)"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-gray-800 border border-gray-400 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-amazon-orange text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-800 dark:text-gray-300 block mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-gray-800 border border-gray-400 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-amazon-orange text-gray-900 dark:text-white"
                />
              </div>

              {/* DPDP Consent */}
              <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700 space-y-2 text-[11px]">
                <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  <span>DPDP Act 2023 Consent</span>
                </div>
                <label className="flex items-start gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={consentEssential}
                    onChange={(e) => setConsentEssential(e.target.checked)}
                    className="mt-0.5 rounded text-amazon-orange focus:ring-amazon-orange"
                  />
                  <span>
                    I consent to Amazon Enterprise processing my personal data for authentication, order delivery, and billing. (Mandatory)
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-amazon-btn-yellow hover:bg-amazon-btn-yellow-hover text-amazon-dark-text font-bold text-xs rounded-md shadow-sm transition flex items-center justify-center gap-2"
              >
                <span>{isLoading ? 'Sending Verification Code...' : 'Verify Email & Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-xs">
              <p className="text-gray-700 dark:text-gray-300">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-amazon-prime font-bold hover:underline">
                  Sign in &rarr;
                </Link>
              </p>
            </div>
          </>
        ) : (
          /* STEP 2: 60-Second Email OTP Verification */
          <div className="space-y-5 animate-fade-in">
            <div>
              <div className="flex items-center gap-2 text-amazon-orange mb-1">
                <Mail className="w-5 h-5" />
                <span className="font-bold text-xs uppercase tracking-wider">Email Verification</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Enter Verification Code
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                We sent a 6-digit verification code to <strong className="text-gray-900 dark:text-white">{email}</strong>.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Test SMTP live preview link banner */}
            {smtpPreviewUrl && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded text-xs space-y-1">
                <span className="font-bold text-amazon-prime block">✉️ Live SMTP Test Inbox:</span>
                <a
                  href={smtpPreviewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amazon-prime hover:underline font-semibold flex items-center gap-1 break-all"
                >
                  <span>Click here to open email in browser &rarr;</span>
                </a>
              </div>
            )}

            <form onSubmit={handleVerifyOTP} className="space-y-5">
              {/* 6-Box OTP Input */}
              <OTPInput value={otp} onChange={setOtp} length={6} disabled={isLoading} />

              {/* 60s Countdown Timer Badge */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/80 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  <Clock className={`w-4 h-4 ${timeLeft <= 10 ? 'text-red-600 animate-pulse' : 'text-amazon-orange'}`} />
                  <span>Code expires in:</span>
                  <span className={`font-mono font-bold text-sm ${timeLeft <= 10 ? 'text-red-600' : 'text-amazon-deal-red'}`}>
                    {String(timeLeft).padStart(2, '0')}s
                  </span>
                </div>

                {/* Resend Button: Active only when 60s timer hits 0 */}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={!isResendActive || isLoading}
                  className={`text-xs font-bold transition flex items-center gap-1 ${
                    isResendActive
                      ? 'text-amazon-prime hover:underline cursor-pointer'
                      : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Resend Code</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className={`w-full py-3 rounded-lg font-bold text-xs shadow-md transition flex items-center justify-center gap-2 ${
                  otp.length === 6 && !isLoading
                    ? 'bg-amazon-btn-yellow hover:bg-amazon-btn-yellow-hover text-amazon-dark-text'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isLoading ? 'Verifying OTP...' : 'Verify OTP & Create Account'}</span>
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                &larr; Change email or details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
