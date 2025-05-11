
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { Track } from '../../data/sampleTracks';

interface PlayerControlsProps {
  isPlaying: boolean;
  currentTrack: Track | null;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  currentTrack,
  onPlayPause,
  onPrevious,
  onNext
}) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onPrevious}
        className="p-2 rounded-full hover:bg-gray-light/50 dark:hover:bg-gray-700/50 text-coffee-dark dark:text-coffee-light transition"
        aria-label="Previous track"
      >
        <SkipBack size={20} />
      </button>
      
      <button
        onClick={onPlayPause}
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
  );
};

export default PlayerControls;
