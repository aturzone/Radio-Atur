
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import TrackInfo from './TrackInfo';
import VolumeControl from './VolumeControl';
import { Track } from '../data/sampleTracks';
import PlayerControls from './player/PlayerControls';
import ProgressBar from './player/ProgressBar';
import NavigationButtons from './player/NavigationButtons';
import AudioPlayer from './player/AudioPlayer';
import { Heart, BookAudio, Image as ImageIcon, Maximize2 } from 'lucide-react';
import { usePlaylist } from '../contexts/PlaylistContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import SongOptionsMenu from './SongOptionsMenu';
import { cn } from '@/lib/utils';

interface MusicPlayerProps {
  currentTrack: Track | null;
  onTrackEnd?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({
  currentTrack,
  onTrackEnd,
  onPrevious,
  onNext
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shouldLoop, setShouldLoop] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showLargeCover, setShowLargeCover] = useState(false);
  
  const { addToFavorites, isTrackInFavorites } = usePlaylist();
  
  // Check if the current track is a favorite
  useEffect(() => {
    if (currentTrack) {
      setIsFavorite(isTrackInFavorites(currentTrack.id));
      // Reset time when changing tracks but don't autoplay
      setCurrentTime(0);
    } else {
      setIsFavorite(false);
    }
  }, [currentTrack, isTrackInFavorites]);
  
  // Player controls
  const togglePlay = () => {
    if (!currentTrack) return;
    console.log("Toggle play/pause. New state:", !isPlaying);
    setIsPlaying(!isPlaying);
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  const toggleLoop = () => {
    setShouldLoop(!shouldLoop);
    toast.success(shouldLoop ? "Loop disabled" : "Loop enabled");
  };
  
  const handleToggleFavorite = () => {
    if (currentTrack) {
      addToFavorites(currentTrack.id); // Pass the track ID, not the track object
    }
  };
  
  // Removed duplicate isFavorite declaration
  
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    }
  };
  
  const handleTimeChange = (value: number[]) => {
    const newTime = value[0];
    console.log("Time updated manually to:", newTime);
    setCurrentTime(newTime);
  };

  const toggleCoverDisplay = () => {
    setShowLargeCover(!showLargeCover);
  };

  // Update window title with current track info
  useEffect(() => {
    if (currentTrack && isPlaying) {
      document.title = `${currentTrack.title} - ${currentTrack.artist} | Cozy Audio Café`;
    } else {
      document.title = "Cozy Audio Café";
    }
  }, [currentTrack, isPlaying]);
  
  return (
    <Card className="w-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-md border-gray-light dark:border-gray-700">
      <CardContent className="p-4 pb-4">
        {currentTrack ? (
          <div className="flex flex-col gap-4">
            {/* Album Cover Section */}
            <div className={cn(
              "transition-all duration-300",
              showLargeCover ? "block mb-4" : "hidden"
            )}>
              <div className="bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden relative w-full">
                <AspectRatio ratio={1} className="w-full">
                  {currentTrack.cover ? (
                    <img 
                      src={currentTrack.cover} 
                      alt={currentTrack.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 dark:bg-gray-800">
                      <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">No image available for this track</p>
                    </div>
                  )}
                </AspectRatio>
              </div>
            </div>
            
            {/* Track Info and Controls */}
            <div className="flex justify-between items-center">
              <TrackInfo currentTrack={currentTrack} isPlaying={isPlaying} />
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleCoverDisplay} 
                  className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:scale-105 transition-all duration-200"
                  title={showLargeCover ? "Hide album cover" : "Show album cover"}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleToggleFavorite} 
                  className={`p-1 ${isFavorite ? 'text-red-500' : 'text-gray-400'} hover:text-red-500 hover:scale-105 transition-all duration-200`}
                  disabled={!currentTrack}
                  title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                </Button>
                <SongOptionsMenu track={currentTrack} />
              </div>
            </div>
            
            <div className="w-full flex flex-col gap-2">
              <ProgressBar 
                currentTime={currentTime}
                duration={duration}
                onTimeChange={handleTimeChange}
              />
              
              <div className="flex items-center justify-between">
                <VolumeControl 
                  volume={volume} 
                  onVolumeChange={handleVolumeChange}
                  isMuted={isMuted}
                  onMuteToggle={toggleMute}
                />
                
                <PlayerControls
                  isPlaying={isPlaying}
                  currentTrack={currentTrack}
                  onPlayPause={togglePlay}
                  onPrevious={onPrevious}
                  onNext={onNext}
                  isLooping={shouldLoop}
                  onLoopToggle={toggleLoop}
                />
                
                <NavigationButtons className="w-24" />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BookAudio className="mb-4 h-12 w-12 text-coffee dark:text-coffee-light opacity-70 animate-pulse" />
            <p className="text-coffee-dark dark:text-coffee-light text-lg font-medium">
              Select a track to start listening
            </p>
            <p className="text-gray dark:text-gray-light text-sm mt-2">
              Your cozy listening experience awaits
            </p>
          </div>
        )}
      </CardContent>
      
      <AudioPlayer
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        volume={volume}
        isMuted={isMuted}
        onTimeUpdate={setCurrentTime}
        onDurationChange={setDuration}
        onEnded={shouldLoop ? () => {} : onTrackEnd}
        currentTime={currentTime}
        shouldLoop={shouldLoop}
      />
    </Card>
  );
};

export default MusicPlayer;
