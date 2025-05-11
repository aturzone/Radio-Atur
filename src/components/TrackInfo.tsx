
import { Track } from '../data/sampleTracks';
import { Music } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrackInfoProps {
  currentTrack: Track | null;
  isPlaying: boolean;
}

const TrackInfo = ({ currentTrack, isPlaying }: TrackInfoProps) => {
  if (!currentTrack) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 animate-fade-in">
        <Music className="h-6 w-6 text-coffee dark:text-coffee-light mb-2" />
        <p className="text-coffee-dark dark:text-coffee-light text-lg font-medium">Select a track to start listening</p>
        <p className="text-gray dark:text-gray-light text-sm">Your cozy listening experience awaits</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 w-full max-w-full">
      <div className={cn(
        "relative min-w-16 h-16 overflow-hidden rounded-md shadow-md",
        isPlaying ? "ring-1 ring-coffee dark:ring-coffee-light" : ""
      )}>
        <img 
          src={currentTrack.cover || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400'} 
          alt={currentTrack.title} 
          className="w-full h-full object-cover"
        />
        <div className={`absolute inset-0 bg-gradient-to-br from-black/20 to-black/5 ${isPlaying ? 'animate-pulse-slow' : ''}`}></div>
        {isPlaying && (
          <div className="absolute bottom-1 right-1 w-2 h-2 bg-coffee dark:bg-coffee-light rounded-full animate-pulse" />
        )}
      </div>
      <div className="flex flex-col min-w-0">
        <h3 className="font-semibold text-coffee-dark dark:text-coffee-light text-lg truncate">{currentTrack.title}</h3>
        <p className="text-gray-dark dark:text-gray text-sm truncate">{currentTrack.artist}</p>
        {currentTrack.album && (
          <p className="text-gray dark:text-gray-light text-xs truncate">{currentTrack.album}</p>
        )}
      </div>
    </div>
  );
};

export default TrackInfo;
