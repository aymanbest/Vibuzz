// Design System for Vibuzz App
// This file contains consistent design tokens used throughout the application

// Custom color palettes for dark and light modes as specified
export const colors = {
  // Light mode colors
  light: {
    primary: '#5409DA',
    secondary: '#4E71FF', 
    accent: '#8DD8FF',
    surface: '#BBFBFF'
  },
  // Dark mode colors  
  dark: {
    primary: '#52357B',
    secondary: '#5459AC',
    accent: '#648DB3', 
    surface: '#B2D8CE'
  },
  // Primary colors - Modern blue for brand recognition
  primary: {
    50: '#ebf5ff',
    100: '#e1efff',
    200: '#c3ddff',
    300: '#9dc1ff',
    400: '#6d9bff',
    500: '#4c7dfa', // Key brand color - more vibrant and accessible
    600: '#2855db', // Primary action color
    700: '#1e3fad',
    800: '#1a338a',
    900: '#162a6e',
  },
  // Secondary colors - Teal for complementary accent
  secondary: {
    50: '#edfcf9',
    100: '#d4f7f0',
    200: '#a4efe1',
    300: '#6ae0d0',
    400: '#39c7b8',
    500: '#20a99c', // More vibrant teal
    600: '#188a81',
    700: '#166f6a',
    800: '#155957',
    900: '#134a49',
  },
  // Neutral colors - More modern grays with subtle blue undertones
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
  },
  // Success, warning, error colors with better contrast
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981', // Better contrast
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Better contrast
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Better contrast
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
};

// Color schemes for different bus line types
export const busLineColors = {
  forward: {
    bg: '#dcfce7',      // Success-100
    text: '#15803d',    // Success-700
    border: '#86efac',  // Success-300
  },
  backward: {
    bg: '#ffedd5',      // Orange-100
    text: '#c2410c',    // Orange-700
    border: '#fdba74',  // Orange-300
  },
};

// Map related colors
export const mapColors = {
  bus: '#ef4444',        // Error-500
  busStop: '#22c55e',    // Success-500
  userLocation: '#3b82f6', // Primary-500
  closestStop: '#eab308',  // Warning-500
  path: '#60a5fa',       // Primary-400
};

// Shadows with improved focus on mobile-friendly values
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  colored: '0 10px 15px -3px var(--shadow-color, rgba(59, 130, 246, 0.3))',
};

export const radii = {
  none: '0',
  xs: '0.125rem', // 2px
  sm: '0.25rem',  // 4px
  md: '0.5rem',   // 8px
  lg: '0.75rem',  // 12px
  xl: '1rem',     // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',  // Full rounded for pills and circles
};

export const spacing = {
  '0': '0',
  px: '1px',
  '0.5': '0.125rem', // 2px
  '1': '0.25rem',    // 4px
  '1.5': '0.375rem', // 6px
  '2': '0.5rem',     // 8px
  '2.5': '0.625rem', // 10px
  '3': '0.75rem',    // 12px
  '3.5': '0.875rem', // 14px
  '4': '1rem',       // 16px
  '5': '1.25rem',    // 20px
  '6': '1.5rem',     // 24px
  '7': '1.75rem',    // 28px
  '8': '2rem',       // 32px
  '9': '2.25rem',    // 36px
  '10': '2.5rem',    // 40px
  '11': '2.75rem',   // 44px
  '12': '3rem',      // 48px
  '14': '3.5rem',    // 56px
  '16': '4rem',      // 64px
  '20': '5rem',      // 80px
  '24': '6rem',      // 96px
  '28': '7rem',      // 112px
  '32': '8rem',      // 128px
  '36': '9rem',      // 144px
  '40': '10rem',     // 160px
  '44': '11rem',     // 176px
  '48': '12rem',     // 192px
  '52': '13rem',     // 208px
  '56': '14rem',     // 224px
  '60': '15rem',     // 240px
  '64': '16rem',     // 256px
  '72': '18rem',     // 288px
  '80': '20rem',     // 320px
  '96': '24rem',     // 384px
};

// Transitions and animations
export const transitions = {
  default: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  slow: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  fast: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
  spring: 'all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1.0)',
  bounce: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  inOut: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  property: {
    opacity: 'opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    color: 'color 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    background: 'background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    shadow: 'box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    border: 'border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Typography
export const typography = {
  fontFamily: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    display: "'Plus Jakarta Sans', 'Inter', sans-serif", // More modern display font
    mono: "'JetBrains Mono', 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', 'Droid Sans Mono', 'Source Code Pro', monospace",
  },
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  fontSize: {
    '2xs': '0.625rem',   // 10px
    xs: '0.75rem',       // 12px
    sm: '0.875rem',      // 14px
    base: '1rem',        // 16px
    lg: '1.125rem',      // 18px
    xl: '1.25rem',       // 20px
    '2xl': '1.5rem',     // 24px
    '3xl': '1.875rem',   // 30px
    '4xl': '2.25rem',    // 36px
    '5xl': '3rem',       // 48px
    '6xl': '3.75rem',    // 60px
    '7xl': '4.5rem',     // 72px
    '8xl': '6rem',       // 96px
    '9xl': '8rem',       // 128px
  },
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

// Common component styles
export const componentStyles = {
  // Modern card styles
  card: {
    base: `bg-white rounded-lg shadow-sm border border-gray-100`,
    hover: `transition-all duration-300 hover:shadow-md hover:border-primary-100`,
    interactive: `cursor-pointer transition-all duration-300 hover:shadow-md hover:border-primary-200 active:scale-[0.98]`,
    glass: `bg-white/90 backdrop-blur-lg border border-white/20 rounded-lg shadow-md`,
  },
  // Button styles with clear visual hierarchy
  button: {
    primary: `bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-medium rounded-lg px-4 py-2.5 shadow-sm transition-all duration-200`,
    secondary: `bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 font-medium rounded-lg px-4 py-2.5 transition-all duration-200`,
    outline: `border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-800 font-medium rounded-lg px-4 py-2.5 transition-all duration-200`,
    text: `text-primary-600 hover:text-primary-800 hover:bg-primary-50 font-medium rounded-lg px-4 py-2.5 transition-all duration-200`,
    icon: `p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-all duration-200`,
  },
  // Enhanced input styles
  input: {
    base: `block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm text-neutral-900 placeholder-neutral-400 
           focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 
           disabled:opacity-50 disabled:bg-neutral-100 disabled:cursor-not-allowed
           transition-all duration-200`,
    search: `pl-10 pr-3 py-2 border border-neutral-300 rounded-full shadow-sm text-neutral-900 placeholder-neutral-400
             focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500
             transition-all duration-200`,
    error: `block w-full px-3 py-2 border border-error-500 rounded-md shadow-sm text-neutral-900 placeholder-neutral-400
            focus:outline-none focus:ring-2 focus:ring-error-500/30 focus:border-error-500
            transition-all duration-200`,
  },
  // Badge variants
  badge: {
    default: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800`,
    primary: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800`,
    secondary: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800`,
    success: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800`,
    warning: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800`,
    error: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-error-100 text-error-800`,
  },
  // Modern Select styles
  select: {
    base: `block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm text-neutral-900 
           focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500
           transition-all duration-200`,
  },
  // Navigation styles
  nav: {
    link: `text-neutral-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200`,
    activeLink: `text-primary-600 hover:text-primary-700 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200`,
    mobileLink: `text-neutral-900 hover:bg-neutral-100 block px-3 py-2 rounded-md text-base font-medium transition-all duration-200`,
  },
  // Table styles
  table: {
    base: `min-w-full divide-y divide-neutral-200 table-fixed`,
    header: `bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider`,
    headerCell: `px-6 py-3`,
    body: `bg-white divide-y divide-neutral-200`,
    row: `hover:bg-neutral-50 transition-colors duration-200`,
    cell: `px-6 py-4 whitespace-nowrap text-sm text-neutral-900`,
  },
};

// Z-index values - More comprehensive for complex layouts
export const zIndices = {
  hide: -1,
  auto: 'auto',
  base: 0,
  raised: 1,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  toast: 1600,
  tooltip: 1700,
  skipLink: 1800,
  // Mobile-specific z-indices
  mobileNav: 100,
  mobileHeader: 90,
  mobileFooter: 80,
  // Map-specific z-indices
  mapControls: 50,
  mapMarkers: 40,
  mapTiles: 10,
};

// Layout and container sizes for consistent widths
export const layout = {
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  maxWidth: {
    none: 'none',
    xs: '20rem',      // 320px
    sm: '24rem',      // 384px
    md: '28rem',      // 448px
    lg: '32rem',      // 512px
    xl: '36rem',      // 576px
    '2xl': '42rem',   // 672px
    '3xl': '48rem',   // 768px
    '4xl': '56rem',   // 896px
    '5xl': '64rem',   // 1024px
    '6xl': '72rem',   // 1152px
    '7xl': '80rem',   // 1280px
    full: '100%',
    min: 'min-content',
    max: 'max-content',
    prose: '65ch',
  },
  aspectRatio: {
    auto: 'auto',
    square: '1/1',
    video: '16/9',
    portrait: '3/4',
    widescreen: '21/9',
  },
};

// Responsive design helpers for consistent media queries
export const responsive = {
  mediaQueries: {
    sm: `@media (min-width: ${breakpoints.sm})`,
    md: `@media (min-width: ${breakpoints.md})`,
    lg: `@media (min-width: ${breakpoints.lg})`,
    xl: `@media (min-width: ${breakpoints.xl})`,
    '2xl': `@media (min-width: ${breakpoints['2xl']})`,
    dark: '@media (prefers-color-scheme: dark)',
    light: '@media (prefers-color-scheme: light)',
    portrait: '@media (orientation: portrait)',
    landscape: '@media (orientation: landscape)',
    motion: '@media (prefers-reduced-motion: no-preference)',
    reducedMotion: '@media (prefers-reduced-motion: reduce)',
    hover: '@media (hover: hover) and (pointer: fine)',
    touch: '@media (hover: none) and (pointer: coarse)',
  },
  hidden: {
    sm: 'hidden sm:block',
    md: 'hidden md:block',
    lg: 'hidden lg:block',
    xl: 'hidden xl:block',
    '2xl': 'hidden 2xl:block',
  },
  visible: {
    sm: 'sm:hidden',
    md: 'md:hidden',
    lg: 'lg:hidden',
    xl: 'xl:hidden',
    '2xl': '2xl:hidden',
  },
};

// Mobile-first responsive sizes for components
export const mobileSizes = {
  touchTarget: '44px', // Minimum touch target size for mobile
  buttonHeight: {
    sm: '32px',
    md: '40px',
    lg: '48px',
  },
  inputHeight: {
    sm: '32px',
    md: '40px',
    lg: '48px',
  },
  headerHeight: {
    sm: '56px',
    md: '64px',
    lg: '72px',
  },
  bottomNavHeight: '56px',
  bottomSheetHandleArea: '24px',
  sidebarWidth: {
    collapsed: '72px',
    expanded: '280px',
  },
};

// Animation presets for consistent motion
export const animationPresets = {
  fadeIn: 'transition-opacity duration-300 ease-in-out',
  scaleUp: 'transition-all duration-300 ease-in-out transform hover:scale-105',
  scaleDown: 'transition-all duration-300 ease-in-out active:scale-95',
  slideIn: 'transition-transform duration-300 ease-in-out',
  pulse: 'animate-pulse',
  float: 'animate-float',
};
