
import { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Radio as RadioIcon, Construction } from 'lucide-react';
import { PlaylistProvider } from '@/contexts/PlaylistContext';

// Create a separate component to use the context
const RadioContent = () => {
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="flex justify-between items-center p-4 border-b bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Link to="/" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            <Home size={20} className="text-coffee-dark dark:text-coffee-light" />
          </Link>
          <h1 className="text-xl font-bold text-coffee-dark dark:text-coffee-light flex items-center gap-2">
            <RadioIcon className="animate-pulse h-5 w-5" />
            <span>Live Radio</span>
          </h1>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="text-coffee-dark dark:text-coffee-light"
        >
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </Button>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="max-w-lg p-8 rounded-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-lg border border-gray-100 dark:border-gray-700 animate-fade-in">
          <Construction size={64} className="mx-auto text-coffee dark:text-coffee-light mb-6" />
          <h2 className="text-2xl font-bold text-coffee-dark dark:text-coffee-light mb-4">Radio Coming Soon</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We're working on bringing you the best radio experience. This feature will be connected to our server in a future update.
          </p>
          <Link to="/">
            <Button className="bg-coffee hover:bg-coffee-dark text-white">
              Return to Music Player
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Wrap the component with PlaylistProvider to fix the context error
const Radio = () => (
  <PlaylistProvider>
    <RadioContent />
  </PlaylistProvider>
);

export default Radio;
