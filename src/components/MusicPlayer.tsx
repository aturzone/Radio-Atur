
import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Music } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import TrackInfo from './TrackInfo';
import VolumeControl from './VolumeControl';
import { Track, findTrackById } from '../data/sampleTracks';

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
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationRef = useRef<number>();
  
  // Update audio when track changes
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (currentTrack) {
      // Reset player state when track changes
      setCurrentTime(0);
      setDuration(0);
      
      // Load the new track
      audioRef.current.src = currentTrack.url;
      audioRef.current.load();
      
      // Auto-play if it was playing before
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error("Playback failed:", error);
          setIsPlaying(false);
        });
      }
    } else {
      // No track to play
      setIsPlaying(false);
    }
  }, [currentTrack]);
  
  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    
    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Playback failed:", error);
          setIsPlaying(false);
        });
      }
      
      // Start the progress bar animation
      animationRef.current = requestAnimationFrame(updateProgress);
    } else {
      audioRef.current.pause();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, currentTrack]);
  
  // Handle volume change
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);
  
  // Progress bar animation
  const updateProgress = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
    animationRef.current = requestAnimationFrame(updateProgress);
  };
  
  // Format time for display
  const formatTime = (time: number) => {
    if (time === 0 || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  };
  
  // Player controls
  const togglePlay = () => {
    if (!currentTrack) return;
    setIsPlaying(!isPlaying);
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
    }
  };
  
  const handleTimeChange = (value: number[]) => {
    if (!audioRef.current) return;
    const newTime = value[0];
    setCurrentTime(newTime);
    audioRef.current.currentTime = newTime;
  };
  
  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };
  
  const handleEnded = () => {
    setIsPlaying(false);
    onTrackEnd();
  };
  
  return (
    <Card className="w-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-md border-gray-light dark:border-gray-700">
      <CardContent className="p-4 pb-4">
        <div className="flex flex-col gap-4">
          <TrackInfo currentTrack={currentTrack} isPlaying={isPlaying} />
          
          <div className="w-full flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray dark:text-gray-300">{formatTime(currentTime)}</span>
              <Slider 
                value={[currentTime]} 
                min={0} 
                max={duration || 100}
                step={0.1}
                className="flex-1" 
                onValueChange={handleTimeChange}
              />
              <span className="text-xs text-gray dark:text-gray-300">{formatTime(duration)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <VolumeControl 
                volume={volume} 
                onVolumeChange={handleVolumeChange}
                isMuted={isMuted}
                onMuteToggle={toggleMute}
              />
              
              <div className="flex items-center gap-2">
                <button
                  onClick={onPrevious}
                  className="p-2 rounded-full hover:bg-gray-light/50 dark:hover:bg-gray-700/50 text-coffee-dark dark:text-coffee-light transition"
                  aria-label="Previous track"
                >
                  <SkipBack size={20} />
                </button>
                
                <button
                  onClick={togglePlay}
                  disabled={!currentTrack}
                  className={`p-3 rounded-full bg-coffee dark:bg-coffee-dark text-white hover:bg-coffee-dark dark:hover:bg-coffee transition ${!currentTrack ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                
                <button
                  onClick={onNext}
                  className="p-2 rounded-full hover:bg-gray-light/50 dark:hover:bg-gray-700/50 text-coffee-dark dark:text-coffee-light transition"
                  aria-label="Next track"
                >
                  <SkipForward size={20} />
                </button>
              </div>
              
              <div className="w-24 flex justify-end">
                <button
                  className="p-1 rounded-md hover:bg-gray-light/50 dark:hover:bg-gray-700/50 text-coffee-dark dark:text-coffee-light transition"
                  aria-label="View music library"
                >
                  <Music size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <audio
        ref={audioRef}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        className="hidden"
      />
    </Card>
  );
};

export default MusicPlayer;
