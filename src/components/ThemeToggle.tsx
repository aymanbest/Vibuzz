import React from 'react';
import { IconSun, IconMoon } from '@tabler/icons-react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  size?: number;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', size = 20 }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
        isDark 
          ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
      } ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <IconSun size={size} className="transition-transform duration-300" />
      ) : (
        <IconMoon size={size} className="transition-transform duration-300" />
      )}
    </button>
  );
};

export default ThemeToggle;
