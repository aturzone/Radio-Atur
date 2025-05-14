import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MusicPlayer from '../components/MusicPlayer';
import PlaylistView from '../components/PlaylistView';
import PlaylistSidebar from '../components/PlaylistSidebar';
import { Track, findTrackById } from '../data/sampleTracks';
import { BookAudio, Menu, Coffee, MoonStar, Sun, Settings, Cloud, Radio, Music } from 'lucide-react';
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose } from '@/components/ui/drawer';
import { useTheme } from '../hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { PlaylistProvider, usePlaylist } from '../contexts/PlaylistContext';
import GoogleDriveSync from '../components/GoogleDriveSync';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import PlaylistViewWrapper from '../components/PlaylistViewWrapper';

// Create a separate component to use the context
const MusicPlayerApp = () => {
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [open, setOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const { theme, setTheme } = useTheme();
  const { library, selectTrack } = usePlaylist();
  
  // Get all tracks in a flattened array (excluding radio stations)
  const getAllTracks = (): Track[] => {
    const tracks: Track[] = [];
    
    const extractTracks = (folders: typeof library) => {
      folders.forEach(folder => {
        // Skip radio stations folder
        if (folder.id === 'radio-stations-folder') return;
        
        tracks.push(...folder.tracks);
        extractTracks(folder.folders);
      });
    };
    
    extractTracks(library);
    return tracks;
  };
  
  const allTracks = getAllTracks();
  
  // Load the current track whenever ID changes
  useEffect(() => {
    if (!currentTrackId) {
      setCurrentTrack(null);
      return;
    }
    
    // First try to find in the context
    const trackFromContext = allTracks.find(track => track.id === currentTrackId);
    if (trackFromContext) {
      setCurrentTrack(trackFromContext);
      return;
    }
    
    // Fallback to sample tracks
    const track = findTrackById(currentTrackId);
    setCurrentTrack(track);
  }, [currentTrackId, allTracks]);
  
  const handleTrackSelect = (track: Track) => {
    selectTrack(track);
    setCurrentTrackId(track.id);
    setOpen(false); // Close the drawer after selecting a track
  };
  
  const handlePrevious = () => {
    if (!currentTrackId || allTracks.length === 0) return;
    
    const currentIndex = allTracks.findIndex(track => track.id === currentTrackId);
    if (currentIndex <= 0) {
      // If at the beginning, go to the last track
      setCurrentTrackId(allTracks[allTracks.length - 1].id);
    } else {
      setCurrentTrackId(allTracks[currentIndex - 1].id);
    }
  };
  
  const handleNext = () => {
    if (!currentTrackId || allTracks.length === 0) return;
    
    const currentIndex = allTracks.findIndex(track => track.id === currentTrackId);
    if (currentIndex >= allTracks.length - 1 || currentIndex === -1) {
      // If at the end or not found, go to the first track
      setCurrentTrackId(allTracks[0].id);
    } else {
      setCurrentTrackId(allTracks[currentIndex + 1].id);
    }
  };
  
  const handleBuyMeCoffee = () => {
    // Replace with your actual Buy Me a Coffee link
    window.open('https://www.buymeacoffee.com/yourusername', '_blank');
    toast.success('Thanks for your support!');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    toast.success(`${theme === 'dark' ? 'Light' : 'Dark' } mode activated`);
  };

  // Listen for Google Drive connect button
  useEffect(() => {
    const handleOpenGoogleDrivePanel = () => {
      setOpen(true);
    };
    
    document.addEventListener('open-google-drive-panel', handleOpenGoogleDrivePanel);
    
    return () => {
      document.removeEventListener('open-google-drive-panel', handleOpenGoogleDrivePanel);
    };
  }, []);
  
  return (
    <div className={`min-h-screen flex flex-col bg-background ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Header with menu button */}
      <header className="p-4 bg-coffee dark:bg-coffee-dark shadow-sm flex items-center justify-between z-10">
        <div className="flex items-center">
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2 text-coffee-light hover:scale-105 transition-transform">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DrawerTrigger>
            <DrawerContent className="h-[85vh] max-w-md">
              <div className="p-4 flex flex-col h-full">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-coffee-dark dark:text-coffee-light flex items-center gap-2">
                    <BookAudio className="h-5 w-5" /> Cozy Audio Café
                  </h2>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="sm" className="hover:scale-105 transition-transform">Close</Button>
                  </DrawerClose>
                </div>
                <Separator className="my-4" />
                
                {/* Music Library Button */}
                <Link to="/music-library" className="w-full mb-4">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Music className="h-5 w-5 text-coffee" />
                    <span>Music Library</span>
                  </Button>
                </Link>
                
                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between p-2 bg-background/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    {theme === 'dark' ? 
                      <MoonStar className="h-5 w-5 text-coffee" /> : 
                      <Sun className="h-5 w-5 text-coffee" />
                    }
                    <span className="font-medium">Dark Mode</span>
                  </div>
                  <Switch 
                    checked={theme === 'dark'}
                    onCheckedChange={toggleTheme}
                  />
                </div>
                
                {/* Google Drive Integration */}
                <GoogleDriveSync />
                
                {/* Settings Button */}
                <Link to="/settings" className="w-full mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Settings className="h-5 w-5 text-coffee" />
                    <span>Settings</span>
                  </Button>
                </Link>
                
                {/* Playlist */}
                <div className="flex-1 overflow-hidden mt-4">
                  <h3 className="text-lg font-semibold text-coffee-dark dark:text-coffee-light mb-4 flex items-center gap-2">
                    <BookAudio className="h-5 w-5" /> Music Library
                  </h3>
                  <ScrollArea className="h-[50vh]">
                    <PlaylistViewWrapper 
                      onTrackSelect={handleTrackSelect}
                      currentTrackId={currentTrackId}
                    />
                  </ScrollArea>
                </div>
                
                {/* Buy Me a Coffee - Moved to bottom */}
                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={handleBuyMeCoffee}
                  >
                    <Coffee className="h-5 w-5 text-coffee" />
                    <span>Buy Me a Coffee</span>
                  </Button>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
          <BookAudio className="text-coffee-light h-6 w-6 mr-2" />
          <h1 className="text-coffee-light text-xl font-semibold">Cozy Audio Café</h1>
        </div>
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/radio"
                  className="p-2 rounded-md bg-coffee-light/10 hover:bg-coffee-light/20 text-coffee-light transition flex items-center gap-1 hover:scale-110 duration-200"
                  aria-label="Go to radio"
                >
                  <Radio size={20} className="icon-bounce" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Radio Stations</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/music-library"
                  className="p-2 rounded-md bg-coffee-light/10 hover:bg-coffee-light/20 text-coffee-light transition flex items-center gap-1 hover:scale-110 duration-200"
                  aria-label="Go to music library"
                >
                  <Music size={20} className="icon-bounce" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Music Library</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="text-coffee-light"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            {showSidebar ? 'Hide Sidebar' : 'Show Sidebar'}
          </Button>
        </div>
      </header>
      
      {/* Main content with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Playlist sidebar */}
        {showSidebar && (
          <PlaylistSidebar 
            onTrackSelect={handleTrackSelect}
            currentTrackId={currentTrackId}
          />
        )}
        
        {/* Player area */}
        <div className="flex-1 flex flex-col items-center p-4 overflow-auto">
          <div className="w-full max-w-3xl flex flex-col items-center">
            <div className="w-full aspect-square md:aspect-video bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-lg flex items-center justify-center overflow-hidden relative mb-8">
              {currentTrack ? (
                <>
                  <img 
                    src={currentTrack.cover || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400'} 
                    alt={currentTrack.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-white/30 dark:from-black/50 to-coffee/30 dark:to-coffee-dark/50 backdrop-blur-sm" />
                  
                  <div className="relative z-10 text-center p-6">
                    <h2 className="text-3xl font-bold text-coffee-dark dark:text-coffee-light mb-2 animate-fade-in">{currentTrack.title}</h2>
                    <p className="text-xl text-coffee dark:text-coffee-light mb-4 animate-fade-in">{currentTrack.artist}</p>
                    {currentTrack.album && (
                      <p className="text-gray-dark dark:text-gray-light italic animate-fade-in">From "{currentTrack.album}"</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center p-8 flex flex-col items-center justify-center">
                  <BookAudio className="mx-auto h-16 w-16 text-coffee dark:text-coffee-light opacity-50 mb-4 animate-pulse" />
                  <h2 className="text-2xl font-semibold text-coffee-dark dark:text-coffee-light">Welcome to Cozy Audio Café</h2>
                  <p className="text-gray-dark dark:text-gray-light mt-2">Select a track from the menu or sidebar to start listening</p>
                  <p className="text-gray-dark dark:text-gray-light mt-4 max-w-md">Relax with your favorite tunes in this cozy virtual bookshop atmosphere</p>
                </div>
              )}
            </div>
            
            {/* Bottom player controls */}
            <div className="w-full max-w-xl">
              <MusicPlayer
                currentTrack={currentTrack}
                onTrackEnd={handleNext}
                onPrevious={handlePrevious}
                onNext={handleNext}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="p-3 text-center text-gray text-sm border-t border-gray-light/50 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm">
        <p>Cozy Audio Café &copy; 2025 | Your relaxing bookshop music experience</p>
      </footer>
    </div>
  );
};

// Wrap the app with the PlaylistProvider
const Index = () => (
  <MusicPlayerApp />
);

export default Index;
