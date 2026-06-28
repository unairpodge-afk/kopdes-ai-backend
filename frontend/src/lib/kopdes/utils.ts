import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * KopDes specific class utilities
 */
export const kopdes = {
  // Card decorations
  cardDeco: 'relative overflow-hidden',
  cardDecoBefore: 'absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent',

  // Button decorations
  btnGlow: 'hover:shadow-[0_0_20px_rgba(220,38,38,0.4)]',
  btnPress: 'active:scale-95',

  // Text gradients
  textGradient: 'bg-gradient-to-r from-red-600 via-red-500 to-amber-500 bg-clip-text text-transparent',
  textGradientMerahPutih: 'bg-gradient-to-r from-red-600 via-white to-red-600 bg-clip-text text-transparent',

  // Border decorations
  borderGlow: 'border border-red-500/30 hover:border-red-500/60',

  // Background patterns
  bgPattern: 'bg-[linear-gradient(135deg,rgba(239,68,68,0.05)_1%,transparent_50%,rgba(245,158,11,0.05)_100%)]',
};
