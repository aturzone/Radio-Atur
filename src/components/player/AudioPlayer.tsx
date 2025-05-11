
import { useRef, useEffect, useState } from 'react';
import { Track } from '../../data/sampleTracks';

interface AudioPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  onEnded: () => void;
  isRadioMode?: boolean; // Radio mode
  currentTime?: number; // Add current time prop for timeline control
  shouldLoop?: boolean; // Add loop control
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  currentTrack,
  isPlaying,
  volume,
  isMuted,
  onTimeUpdate,
  onDurationChange,
  onEnded,
  isRadioMode = false,
  currentTime,
  shouldLoop = false
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationRef = useRef<number>();
  const [lastUrl, setLastUrl] = useState<string>('');
  const [isUserSeeking, setIsUserSeeking] = useState(false);
  
  // Update audio when track changes
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    
    console.log("Track changed:", currentTrack.title, currentTrack.url);
    
    const isNewTrack = currentTrack.url !== lastUrl;
    
    // Only process if this is a new track
    if (isNewTrack) {
      setLastUrl(currentTrack.url);
      
      // Reset player state when track changes (only for non-radio mode)
      if (!isRadioMode) {
        onTimeUpdate(0);
        onDurationChange(0);
      }
      
      // Load the new track
      audioRef.current.src = currentTrack.url;
      audioRef.current.load();
    }
    
    // Set loop attribute
    if (audioRef.current) {
      audioRef.current.loop = shouldLoop;
      // We don't auto-play here, play/pause is controlled by the isPlaying effect
    }
  }, [currentTrack, isRadioMode, onTimeUpdate, onDurationChange, shouldLoop, lastUrl]);
  
  // Handle external time updates (from the progress bar)
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    
    // Only update if the difference is significant (to avoid small fluctuations)
    if (currentTime !== undefined && Math.abs((audioRef.current.currentTime || 0) - currentTime) > 0.5) {
      console.log("Setting time to:", currentTime);
      audioRef.current.currentTime = currentTime;
      
      // Make sure we reflect this in the UI immediately
      onTimeUpdate(currentTime);
    }
  }, [currentTime, currentTrack, onTimeUpdate]);
  
  // Handle loop setting changes
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.loop = shouldLoop;
  }, [shouldLoop]);
  
  // Handle play/pause separately from track loading
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    
    if (isPlaying) {
      console.log("Attempting to play:", currentTrack.title);
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Playback started successfully");
            // Ensure playback rate is normal (1.0)
            if (audioRef.current) {
              audioRef.current.playbackRate = 1.0;
            }
          })
          .catch(error => {
            console.error("Playback failed:", error);
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
    // Only update if the user is not currently seeking
    if (!isUserSeeking && audioRef.current.currentTime >= 0) {
      onTimeUpdate(audioRef.current.currentTime);
    }
    animationRef.current = requestAnimationFrame(updateProgress);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    const duration = audioRef.current.duration;
    console.log("Track loaded with duration:", duration);
    onDurationChange(duration);
    
    // Set playback rate to normal
    audioRef.current.playbackRate = 1.0;
  };
  
  return (
    <audio
      ref={audioRef}
      onTimeUpdate={() => {
        if (!isUserSeeking && audioRef.current) {
          onTimeUpdate(audioRef.current.currentTime);
        }
      }}
      onLoadedMetadata={handleLoadedMetadata}
      onEnded={onEnded}
      onError={(e) => console.error("Audio error:", e)}
      loop={shouldLoop}
      preload="auto"
      className="hidden"
    />
  );
};

export default AudioPlayer;
