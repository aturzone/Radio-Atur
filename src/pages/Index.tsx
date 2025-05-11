
import { useState, useEffect } from 'react';
import MusicPlayer from '../components/MusicPlayer';
import PlaylistView from '../components/PlaylistView';
import { Track, findTrackById, musicLibrary } from '../data/sampleTracks';
import { BookAudio, Menu, Coffee, MoonStar, Sun } from 'lucide-react';
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose } from '@/components/ui/drawer';
import { useTheme } from '../hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const Index = () => {
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  
  // Load the current track whenever ID changes
  useEffect(() => {
    if (!currentTrackId) {
      setCurrentTrack(null);
      return;
    }
    
    const track = findTrackById(currentTrackId);
    setCurrentTrack(track);
  }, [currentTrackId]);

  // Set a default track when the component mounts
  useEffect(() => {
    if (musicLibrary.length > 0 && musicLibrary[0].tracks.length > 0) {
      setCurrentTrackId(musicLibrary[0].tracks[0].id);
    }
  }, []);
  
  const handleTrackSelect = (track: Track) => {
    setCurrentTrackId(track.id);
    setOpen(false); // Close the drawer after selecting a track
  };
  
  // Get all tracks in a flattened array for previous/next functionality
  const getAllTracks = (): Track[] => {
    const tracks: Track[] = [];
    
    const extractTracks = (folders: typeof musicLibrary) => {
      folders.forEach(folder => {
        tracks.push(...folder.tracks);
        extractTracks(folder.folders);
      });
    };
    
    extractTracks(musicLibrary);
    return tracks;
  };
  
  const allTracks = getAllTracks();
  
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
    toast.success(`${theme === 'dark' ? 'Light' : 'Dark'} mode activated`);
  };
  
  return (
    <div className={`min-h-screen flex flex-col bg-background ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Header with menu button */}
      <header className="p-4 bg-coffee dark:bg-coffee-dark shadow-sm flex items-center justify-between">
        <div className="flex items-center">
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2 text-coffee-light">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DrawerTrigger>
            <DrawerContent className="h-[85vh] max-w-md">
              <div className="p-4 space-y-6 flex flex-col h-full">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-coffee-dark dark:text-coffee-light flex items-center gap-2">
                    <BookAudio className="h-5 w-5" /> Cozy Audio Café
                  </h2>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="sm">Close</Button>
                  </DrawerClose>
                </div>
                <Separator />
                
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
                
                {/* Playlist */}
                <div className="flex-1 overflow-auto">
                  <h3 className="text-lg font-semibold text-coffee-dark dark:text-coffee-light mb-4 flex items-center gap-2">
                    <BookAudio className="h-5 w-5" /> Music Library
                  </h3>
                  <div className="max-h-[50vh] overflow-y-auto pr-2">
                    <PlaylistView 
                      onTrackSelect={handleTrackSelect}
                      currentTrackId={currentTrackId}
                    />
                  </div>
                </div>
                
                {/* Buy Me a Coffee - Moved to bottom */}
                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center gap-2"
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
      </header>
      
      {/* Main content - Simplified to focus on the music player */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Player area */}
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
                  <h2 className="text-3xl font-bold text-coffee-dark dark:text-coffee-light mb-2">{currentTrack.title}</h2>
                  <p className="text-xl text-coffee dark:text-coffee-light mb-4">{currentTrack.artist}</p>
                  {currentTrack.album && (
                    <p className="text-gray-dark dark:text-gray-light italic">From "{currentTrack.album}"</p>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center p-8">
                <BookAudio className="mx-auto h-16 w-16 text-coffee dark:text-coffee-light opacity-50 mb-4" />
                <h2 className="text-2xl font-semibold text-coffee-dark dark:text-coffee-light">Welcome to Cozy Audio Café</h2>
                <p className="text-gray-dark dark:text-gray-light mt-2">Select a track from the menu to start listening</p>
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
      
      {/* Footer */}
      <footer className="p-3 text-center text-gray text-sm border-t border-gray-light/50 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm">
        <p>Cozy Audio Café &copy; 2025 | Your relaxing bookshop music experience</p>
      </footer>
    </div>
  );
};

export default Index;
