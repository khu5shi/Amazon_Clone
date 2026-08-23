import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import DOMPurify from 'dompurify';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function sanitizeText(dirty: string): string {
  if (typeof window === 'undefined') return dirty;
  return DOMPurify.sanitize(dirty);
}

export function maskPhone(phone?: string): string {
  if (!phone) return '';
  return phone.replace(/(\d{2})\d+(\d{3})/, '$1*****$2');
}

export function maskEmail(email?: string): string {
  if (!email) return '';
  const [user, domain] = email.split('@');
  if (!domain) return email;
  return `${user.slice(0, 2)}***@${domain}`;
}

export function formatDate(dateString: string | Date): string {
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
