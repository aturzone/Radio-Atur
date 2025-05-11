
import { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { RadioChannel, radioChannels } from '@/data/sampleTracks';
import RadioPlayer from '@/components/RadioPlayer';
import { Button } from '@/components/ui/button';
import { Home, Radio as RadioIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PlaylistProvider } from '@/contexts/PlaylistContext';

// Create a separate component to use the context
const RadioContent = () => {
  const { theme, setTheme } = useTheme();
  const [selectedChannel, setSelectedChannel] = useState<RadioChannel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Auto-select the first channel when component mounts
  useEffect(() => {
    if (radioChannels.length > 0 && !selectedChannel) {
      // Add a small delay to simulate loading for a better UX
      setIsLoading(true);
      const timer = setTimeout(() => {
        setSelectedChannel(radioChannels[0]);
        setIsLoading(false);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Animation when selecting a channel
  const selectChannel = (channel: RadioChannel) => {
    if (selectedChannel?.id === channel.id) return;
    
    setIsLoading(true);
    
    // Simulate loading for a smooth transition
    setTimeout(() => {
      setSelectedChannel(channel);
      setIsLoading(false);
    }, 500);
  };
  
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
      
      <div className="flex flex-col md:flex-row flex-1 p-4 gap-4">
        <aside className="w-full md:w-64 space-y-4 animate-fade-in">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-4 shadow-md border border-gray-100 dark:border-gray-700">
            <h2 className="font-semibold text-coffee-dark dark:text-coffee-light mb-4">Radio Channels</h2>
            <div className="space-y-2">
              {radioChannels.map(channel => (
                <Button
                  key={channel.id}
                  variant={selectedChannel?.id === channel.id ? "default" : "outline"}
                  className={`w-full justify-start gap-2 transition-all ${
                    selectedChannel?.id === channel.id 
                      ? "bg-coffee hover:bg-coffee-dark text-white" 
                      : "text-coffee-dark dark:text-coffee-light"
                  }`}
                  onClick={() => selectChannel(channel)}
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                    <img 
                      src={channel.cover} 
                      alt={channel.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="truncate">{channel.name}</span>
                </Button>
              ))}
            </div>
          </div>
        </aside>
        
        <main className="flex-1 flex flex-col items-center justify-center p-4 animate-fade-in">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-8">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 border-t-coffee dark:border-t-coffee-light rounded-full animate-spin"></div>
              </div>
              <p className="mt-4 text-coffee-dark dark:text-coffee-light">Tuning to station...</p>
            </div>
          ) : selectedChannel ? (
            <RadioPlayer currentChannel={selectedChannel} />
          ) : (
            <div className="text-center p-8 max-w-md mx-auto">
              <RadioIcon size={64} className="mx-auto text-coffee-dark dark:text-coffee-light opacity-50" />
              <h2 className="text-xl font-bold mt-4 text-coffee-dark dark:text-coffee-light">Select a Radio Channel</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Choose from our curated selection of radio channels to start listening
              </p>
            </div>
          )}
        </main>
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
