
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import TrackInfo from './TrackInfo';
import VolumeControl from './VolumeControl';
import { Track } from '../data/sampleTracks';
import PlayerControls from './player/PlayerControls';
import ProgressBar from './player/ProgressBar';
import NavigationButtons from './player/NavigationButtons';
import AudioPlayer from './player/AudioPlayer';

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
    const newTime = value[0];
    setCurrentTime(newTime);
  };
  
  return (
    <Card className="w-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-md border-gray-light dark:border-gray-700">
      <CardContent className="p-4 pb-4">
        <div className="flex flex-col gap-4">
          <TrackInfo currentTrack={currentTrack} isPlaying={isPlaying} />
          
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
        onEnded={onTrackEnd}
      />
    </Card>
  );
};

export default MusicPlayer;
