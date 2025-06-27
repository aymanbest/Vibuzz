import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    // Check for saved theme preference or default to light mode
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    return false; // Default to light mode instead of system preference
  });

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;
    
    if (isDark) {
      root.classList.add('dark');
      // Set custom CSS properties for dark mode
      root.style.setProperty('--color-primary', '#52357B');
      root.style.setProperty('--color-secondary', '#5459AC');
      root.style.setProperty('--color-accent', '#648DB3');
      root.style.setProperty('--color-surface', '#B2D8CE');
      root.style.setProperty('--color-background', '#1a1a1a');
      root.style.setProperty('--color-text', '#ffffff');
      root.style.setProperty('--color-text-secondary', '#b3b3b3');
    } else {
      root.classList.remove('dark');
      // Set custom CSS properties for light mode
      root.style.setProperty('--color-primary', '#5409DA');
      root.style.setProperty('--color-secondary', '#4E71FF');
      root.style.setProperty('--color-accent', '#8DD8FF');
      root.style.setProperty('--color-surface', '#BBFBFF');
      root.style.setProperty('--color-background', '#ffffff');
      root.style.setProperty('--color-text', '#1a1a1a');
      root.style.setProperty('--color-text-secondary', '#666666');
    }

    // Save preference
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const setTheme = (theme: 'light' | 'dark') => {
    setIsDark(theme === 'dark');
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
