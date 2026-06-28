/**
 * KopDes UI Theme Configuration
 * Village Cooperative - Merah Putih Theme
 */

export const kopdesTheme = {
  colors: {
    // Primary Red (Merah)
    primary: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    // Secondary White (Putih)
    secondary: {
      50: '#ffffff',
      100: '#fafafa',
      200: '#f5f5f5',
      300: '#e5e5e5',
      400: '#d4d4d4',
      500: '#a3a3a3',
      600: '#737373',
      700: '#525252',
      800: '#404040',
      900: '#262626',
    },
    // Accent Gold (Emas - untuk highlight)
    accent: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    // Success Green (Hijau - cooperative)
    success: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
    },
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    glow: '0 0 20px rgba(220, 38, 38, 0.3)',
    'glow-gold': '0 0 20px rgba(245, 158, 11, 0.3)',
  },
  animations: {
    fadeIn: {
      duration: 0.3,
      ease: 'easeOut',
    },
    slideUp: {
      duration: 0.4,
      ease: 'easeOut',
    },
    scale: {
      duration: 0.2,
      ease: 'easeInOut',
    },
    bounce: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export type KopdesTheme = typeof kopdesTheme;

// CSS Variables for Tailwind integration
export const cssVariables = `
  :root {
    --kopdes-red-50: #fef2f2;
    --kopdes-red-100: #fee2e2;
    --kopdes-red-200: #fecaca;
    --kopdes-red-300: #fca5a5;
    --kopdes-red-400: #f87171;
    --kopdes-red-500: #ef4444;
    --kopdes-red-600: #dc2626;
    --kopdes-red-700: #b91c1c;
    --kopdes-red-800: #991b1b;
    --kopdes-red-900: #7f1d1d;

    --kopdes-gold-400: #fbbf24;
    --kopdes-gold-500: #f59e0b;
    --kopdes-gold-600: #d97706;

    --kopdes-green-400: #34d399;
    --kopdes-green-500: #10b981;
    --kopdes-green-600: #059669;
  }
`;
