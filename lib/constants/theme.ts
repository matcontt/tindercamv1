// lib/constants/theme.ts
export const COLORS = {
    // Primarios
    emerald: {
      50: '#ecfdf5',
      100: '#d1fae5',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      900: '#064e3b',
    },
    rose: {
      50: '#fff1f2',
      100: '#ffe4e6',
      400: '#fb7185',
      500: '#f43f5e',
      600: '#e11d48',
      700: '#be123c',
      900: '#881337',
    },
    amber: {
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
    },
    
    // Neutrales (Dark Theme)
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712',
    },
    
    // Especiales
    white: '#ffffff',
    black: '#000000',
    transparent: 'transparent',
  };
  
  export const SHADOWS = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
    
    // Custom colored shadows
    emerald: 'shadow-2xl shadow-emerald-500/30',
    rose: 'shadow-2xl shadow-rose-500/30',
    amber: 'shadow-2xl shadow-amber-500/30',
  };
  
  export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  };
  
  export const RADIUS = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    full: 9999,
  };
  
  export const LAYOUT = {
    // Camera
    CAMERA_ZOOM_MIN: 1,
    CAMERA_ZOOM_MAX_BACK: 10,
    CAMERA_ZOOM_MAX_FRONT: 3,
    
    // Gallery
    GALLERY_COLUMNS: 3,
    GALLERY_GAP: 12,
    
    // Trash
    TRASH_COLUMNS: 2,
    TRASH_GAP: 12,
    
    // Photo limits
    GALLERY_LIMIT: 15,
    TRASH_LIMIT: 10,
    TRASH_DAYS: 7,
  };
  
  export const ANIMATIONS = {
    spring: {
      damping: 20,
      stiffness: 300,
      mass: 0.8,
    },
    timing: {
      fast: 150,
      medium: 300,
      slow: 500,
    },
  };