import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { SunIcon, MoonIcon } from '@heroicons/react/20/solid';

function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-800"
      onClick={toggleTheme}
    >
      {theme === 'light' ? (
        <MoonIcon className="w-4 h-4 text-gray-600" />
      ) : (
        <SunIcon className="w-4 h-4 text-white-400" />
      )}
    </button>
  );
}

export default ThemeSelector;