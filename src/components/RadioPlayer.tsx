
import { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { RadioChannel } from '../data/sampleTracks';
import AudioPlayer from './player/AudioPlayer';
import { toast } from 'sonner';

interface RadioPlayerProps {
  currentChannel: RadioChannel | null;
}

const RadioPlayer: React.FC<RadioPlayerProps> = ({ currentChannel }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Get current track based on index
  const currentTrack = currentChannel?.tracks[currentTrackIndex] || null;
  
  // When channel changes, start playing the first track
  useEffect(() => {
    if (currentChannel) {
      console.log("Radio channel changed to:", currentChannel.name);
      // Reset to first track when changing channels
      setCurrentTrackIndex(0);
      setIsPlaying(true);
      
      // Show toast notification
      toast.success(`Now playing: ${currentChannel.name} radio`);
    } else {
      setIsPlaying(false);
    }
  }, [currentChannel]);

  // Log whenever the current track changes
  useEffect(() => {
    if (currentTrack) {
      console.log("Playing radio track:", currentTrack.title, "from channel:", currentChannel?.name);
    }
  }, [currentTrack, currentChannel]);
  
  const handleTrackEnd = () => {
    if (!currentChannel || currentChannel.tracks.length === 0) return;
    
    // Move to next track in the channel, loop back to start if at end
    const nextIndex = (currentTrackIndex + 1) % currentChannel.tracks.length;
    console.log("Radio track ended, moving to next track. Current:", currentTrackIndex, "Next:", nextIndex);
    setCurrentTrackIndex(nextIndex);
    
    // Notify user of track change
    if (currentChannel.tracks[nextIndex]) {
      toast.info(`Now playing: ${currentChannel.tracks[nextIndex].title}`);
    }
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume[0]);
    if (isMuted && newVolume[0] > 0) {
      setIsMuted(false);
    }
  };
  
  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };
  
  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
  };
  
  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-lg border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="relative">
          {currentChannel && (
            <div className="relative aspect-square overflow-hidden">
              <img 
                src={currentChannel.cover} 
                alt={currentChannel.name} 
                className="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                <div className="text-white">
                  <h3 className="text-xl font-bold">{currentChannel.name}</h3>
                  <p className="text-sm opacity-80">{currentChannel.description}</p>
                </div>
                
                {currentTrack && (
                  <div className="mt-2 text-white/80 animate-pulse-slow">
                    <p className="text-sm font-medium">{currentTrack.title}</p>
                    <p className="text-xs">{currentTrack.artist}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-coffee-dark dark:text-coffee-light transition"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX size={20} />
                ) : (
                  <Volume2 size={20} />
                )}
              </button>
              <Slider
                value={[volume]}
                min={0}
                max={1}
                step={0.01}
                className="w-24"
                onValueChange={handleVolumeChange}
              />
            </div>
            
            <div className="animate-pulse">
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-1 h-6 bg-coffee dark:bg-coffee-light rounded-full"
                    style={{
                      animation: `pulse ${1 + i * 0.2}s infinite alternate`,
                      height: `${16 + Math.random() * 10}px`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Making sure we pass the correct track to AudioPlayer */}
      {currentTrack && (
        <AudioPlayer
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          volume={volume}
          isMuted={isMuted}
          onTimeUpdate={handleTimeUpdate}
          onDurationChange={handleDurationChange}
          onEnded={handleTrackEnd}
          isRadioMode={true}
          currentTime={currentTime}
        />
      )}
    </div>
  );
};

export default RadioPlayer;
