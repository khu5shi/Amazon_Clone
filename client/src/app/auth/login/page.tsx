'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, Lock, Mail, Clock, RotateCcw, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { OTPInput } from '../../../components/auth/OTPInput';

export default function LoginPage() {
  const router = useRouter();
  const { login, sendLoginOTP, verifyLoginOTP, resendOTP } = useAuth();

  // Mode: 'password' | 'otp'
  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');
  const [otpStep, setOtpStep] = useState<1 | 2>(1); // 1 = Enter Email, 2 = Enter 6-digit OTP

  // Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  // 60-Second Timer
  const [timeLeft, setTimeLeft] = useState(60);
  const [isResendActive, setIsResendActive] = useState(false);
  const [smtpPreviewUrl, setSmtpPreviewUrl] = useState<string | undefined>(undefined);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (authMode === 'otp' && otpStep === 2 && timeLeft > 0) {
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
  }, [authMode, otpStep, timeLeft]);

  // Standard Password Sign-in
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Login Step 1: Send 60s OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await sendLoginOTP(email);
      setSmtpPreviewUrl(res.previewUrl);
      setTimeLeft(60);
      setIsResendActive(false);
      setOtpStep(2);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send sign-in OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Login Step 2: Verify 60s OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit code.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      await verifyLoginOTP(email, otp);
      router.push('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid or expired OTP code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend Login OTP
  const handleResendOTP = async () => {
    if (!isResendActive) return;
    setIsLoading(true);
    setErrorMsg('');
    setOtp('');
    try {
      const res = await resendOTP(email, 'login');
      setSmtpPreviewUrl(res.previewUrl);
      setTimeLeft(60);
      setIsResendActive(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend OTP.');
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
      <div className="bg-white dark:bg-[#131926] p-8 rounded-lg shadow-sm border border-gray-300 dark:border-gray-700 max-w-sm w-full space-y-5">
        {/* Toggle Mode */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 pb-2">
          <button
            type="button"
            onClick={() => {
              setAuthMode('password');
              setErrorMsg('');
            }}
            className={`flex-1 text-center py-1.5 font-bold text-xs border-b-2 transition ${
              authMode === 'password'
                ? 'border-amazon-orange text-amazon-navy dark:text-white'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Password Sign-in
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('otp');
              setOtpStep(1);
              setErrorMsg('');
            }}
            className={`flex-1 text-center py-1.5 font-bold text-xs border-b-2 transition ${
              authMode === 'otp'
                ? 'border-amazon-orange text-amazon-navy dark:text-white'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Email OTP Sign-in
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. PASSWORD SIGN IN */}
        {authMode === 'password' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4 animate-fade-in">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Sign in</h1>

            <div>
              <label className="text-xs font-bold text-gray-800 dark:text-gray-300 block mb-1">
                Email address
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
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-gray-800 border border-gray-400 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-amazon-orange text-gray-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-amazon-btn-yellow hover:bg-amazon-btn-yellow-hover text-amazon-dark-text font-bold text-xs rounded-md shadow-sm transition"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        )}

        {/* 2. EMAIL OTP SIGN IN */}
        {authMode === 'otp' && otpStep === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-4 animate-fade-in">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">One-Time Sign in</h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              We&apos;ll send a 60-second verification code to your registered email.
            </p>

            <div>
              <label className="text-xs font-bold text-gray-800 dark:text-gray-300 block mb-1">
                Email address
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-amazon-btn-yellow hover:bg-amazon-btn-yellow-hover text-amazon-dark-text font-bold text-xs rounded-md shadow-sm transition flex items-center justify-center gap-1.5"
            >
              <span>{isLoading ? 'Sending Code...' : 'Get Sign-in OTP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 2. EMAIL OTP SIGN IN - ENTER 6-DIGIT OTP */}
        {authMode === 'otp' && otpStep === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-4 animate-fade-in">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Enter Sign-in Code</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                Sent to <strong className="text-gray-900 dark:text-white">{email}</strong>
              </p>
            </div>

            {smtpPreviewUrl && (
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded text-[11px]">
                <a
                  href={smtpPreviewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amazon-prime font-semibold hover:underline block"
                >
                  ✉️ Open Live Test Email Preview &rarr;
                </a>
              </div>
            )}

            <OTPInput value={otp} onChange={setOtp} length={6} disabled={isLoading} />

            <div className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-gray-300">
                <Clock className={`w-3.5 h-3.5 ${timeLeft <= 10 ? 'text-red-600 animate-pulse' : 'text-amazon-orange'}`} />
                <span>Expires in:</span>
                <span className="font-mono font-bold text-amazon-deal-red">{String(timeLeft).padStart(2, '0')}s</span>
              </div>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={!isResendActive || isLoading}
                className={`font-bold transition ${
                  isResendActive ? 'text-amazon-prime hover:underline cursor-pointer' : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                Resend Code
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className={`w-full py-2.5 rounded-md font-bold text-xs shadow-sm transition ${
                otp.length === 6 && !isLoading
                  ? 'bg-amazon-btn-yellow hover:bg-amazon-btn-yellow-hover text-amazon-dark-text'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Verifying...' : 'Sign in'}
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
          By signing in, you agree to Amazon&apos;s Conditions of Use & Sale and DPDP Act Notice.
        </div>
      </div>

      {/* New to Amazon Divider */}
      <div className="max-w-sm w-full mt-6 space-y-3">
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-300 dark:border-gray-700" />
          <span className="flex-shrink mx-3 text-[11px] text-gray-500 font-medium">
            New to Amazon?
          </span>
          <div className="flex-grow border-t border-gray-300 dark:border-gray-700" />
        </div>

        <Link
          href="/auth/register"
          className="w-full block text-center py-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md font-bold text-xs text-gray-800 dark:text-white shadow-sm transition"
        >
          Create your Amazon account
        </Link>
      </div>
    </div>
  );
}
