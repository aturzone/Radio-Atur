
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import TrackInfo from './TrackInfo';
import VolumeControl from './VolumeControl';
import { Track } from '../data/sampleTracks';
import PlayerControls from './player/PlayerControls';
import ProgressBar from './player/ProgressBar';
import NavigationButtons from './player/NavigationButtons';
import AudioPlayer from './player/AudioPlayer';
import { Heart } from 'lucide-react';
import { usePlaylist } from '../contexts/PlaylistContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface MusicPlayerProps {
  currentTrack: Track | null;
  onTrackEnd: () => void;
  onPrevious: () => void;
  onNext: () => void;
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
  
  const { addToFavorites, isTrackInFavorites } = usePlaylist();
  
  // Check if the current track is a favorite
  useEffect(() => {
    if (currentTrack) {
      setIsFavorite(isTrackInFavorites(currentTrack.id));
      // Reset time when changing tracks
      setCurrentTime(0);
      // Do NOT auto-play when a new track is selected
      // The user must explicitly click play
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
  
  const toggleFavorite = () => {
    if (!currentTrack) return;
    
    addToFavorites(currentTrack);
    setIsFavorite(!isFavorite);
    
    if (!isFavorite) {
      toast.success("Added to favorites");
    } else {
      toast.success("Removed from favorites");
    }
  };
  
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
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <TrackInfo currentTrack={currentTrack} isPlaying={isPlaying} />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleFavorite} 
              className={`p-1 ${isFavorite ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`}
              disabled={!currentTrack}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
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
