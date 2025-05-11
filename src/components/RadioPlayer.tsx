
import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { RadioChannel, shuffleArray } from '../data/sampleTracks';

interface RadioPlayerProps {
  currentChannel: RadioChannel | null;
}

const RadioPlayer: React.FC<RadioPlayerProps> = ({ currentChannel }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [shuffledTracks, setShuffledTracks] = useState<Array<any>>([]);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Shuffle tracks when channel changes
  useEffect(() => {
    if (currentChannel) {
      const shuffled = shuffleArray([...currentChannel.tracks]);
      setShuffledTracks(shuffled);
      setCurrentTrackIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
      setShuffledTracks([]);
    }
  }, [currentChannel]);
  
  // Play audio when shuffled tracks change
  useEffect(() => {
    if (!audioRef.current || shuffledTracks.length === 0) return;
    
    audioRef.current.src = shuffledTracks[currentTrackIndex].url;
    audioRef.current.load();
    
    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Playback failed:", error);
          setIsPlaying(false);
        });
      }
    }
  }, [shuffledTracks, currentTrackIndex, isPlaying]);
  
  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current || shuffledTracks.length === 0) return;
    
    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Playback failed:", error);
          setIsPlaying(false);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, shuffledTracks.length]);
  
  // Handle volume change
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);
  
  const handleTrackEnd = () => {
    if (shuffledTracks.length === 0) return;
    
    // Move to next track in shuffle, loop back to start if at end
    const nextIndex = (currentTrackIndex + 1) % shuffledTracks.length;
    setCurrentTrackIndex(nextIndex);
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
  
  const currentTrack = shuffledTracks[currentTrackIndex];
  
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
      
      <audio
        ref={audioRef}
        onEnded={handleTrackEnd}
        className="hidden"
      />
    </div>
  );
};

export default RadioPlayer;
