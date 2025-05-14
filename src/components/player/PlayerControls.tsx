
import { Play, Pause, SkipBack, SkipForward, Repeat } from 'lucide-react';
import { Track } from '../../data/sampleTracks';

interface PlayerControlsProps {
  isPlaying: boolean;
  currentTrack: Track | null;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  isLooping?: boolean;
  onLoopToggle?: () => void;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  currentTrack,
  onPlayPause,
  onPrevious,
  onNext,
  isLooping = false,
  onLoopToggle
}) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onPrevious}
        className="p-2 rounded-full hover:bg-gray-light/50 dark:hover:bg-gray-700/50 text-coffee-dark dark:text-coffee-light transition hover:scale-110 duration-200"
        aria-label="Previous track"
        disabled={!currentTrack}
      >
        <SkipBack size={20} />
      </button>
      
      <button
        onClick={onPlayPause}
        disabled={!currentTrack}
        className={`p-3 rounded-full bg-coffee dark:bg-coffee-dark text-white hover:bg-coffee-dark dark:hover:bg-coffee transition ${!currentTrack ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 duration-200'}`}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>
      
      <button
        onClick={onNext}
        className="p-2 rounded-full hover:bg-gray-light/50 dark:hover:bg-gray-700/50 text-coffee-dark dark:text-coffee-light transition hover:scale-110 duration-200"
        aria-label="Next track"
        disabled={!currentTrack}
      >
        <SkipForward size={20} />
      </button>
      
      {onLoopToggle && (
        <button
          onClick={onLoopToggle}
          className={`p-2 rounded-full hover:bg-gray-light/50 dark:hover:bg-gray-700/50 transition hover:scale-110 duration-200 ${
            isLooping ? 'text-coffee dark:text-coffee-light' : 'text-gray-400 dark:text-gray-600'
          }`}
          aria-label={isLooping ? 'Disable loop' : 'Enable loop'}
          disabled={!currentTrack}
        >
          <Repeat size={18} />
        </button>
      )}
    </div>
  );
};

export default PlayerControls;
