
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
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  currentTrack,
  isPlaying,
  volume,
  isMuted,
  onTimeUpdate,
  onDurationChange,
  onEnded
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationRef = useRef<number>();
  
  // Update audio when track changes
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (currentTrack) {
      // Reset player state when track changes
      onTimeUpdate(0);
      onDurationChange(0);
      
      // Load the new track
      audioRef.current.src = currentTrack.url;
      audioRef.current.load();
      
      // Auto-play if it was playing before
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error("Playback failed:", error);
        });
      }
    }
  }, [currentTrack, onTimeUpdate, onDurationChange]);
  
  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    
    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
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
    onTimeUpdate(audioRef.current.currentTime);
    animationRef.current = requestAnimationFrame(updateProgress);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    onDurationChange(audioRef.current.duration);
  };
  
  return (
    <audio
      ref={audioRef}
      onTimeUpdate={() => onTimeUpdate(audioRef.current?.currentTime || 0)}
      onLoadedMetadata={handleLoadedMetadata}
      onEnded={onEnded}
      className="hidden"
    />
  );
};

export default AudioPlayer;
