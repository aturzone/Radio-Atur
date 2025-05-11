
import React from 'react';
import { Volume, Volume1, Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Tooltip } from '@/components/ui/tooltip';
import { TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (value: number) => void;
  isMuted: boolean;
  onMuteToggle: () => void;
}

const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  onVolumeChange,
  isMuted,
  onMuteToggle,
}) => {
  const handleVolumeChange = (value: number[]) => {
    onVolumeChange(value[0]);
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX className="h-5 w-5" />;
    if (volume < 0.33) return <Volume className="h-5 w-5" />;
    if (volume < 0.67) return <Volume1 className="h-5 w-5" />;
    return <Volume2 className="h-5 w-5" />;
  };

  const volumePercentage = Math.round((isMuted ? 0 : volume) * 100);

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onMuteToggle}
              className="text-coffee-dark dark:text-coffee-light hover:text-coffee transition p-1 rounded-full hover:bg-coffee-light/20"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {getVolumeIcon()}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isMuted ? 'Unmute' : 'Mute'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <Slider
        defaultValue={[volume * 100]}
        max={100}
        step={1}
        value={[isMuted ? 0 : volume * 100]}
        onValueChange={(value) => handleVolumeChange([value[0] / 100])}
        className="w-24"
      />
      
      <span className="text-xs text-gray dark:text-gray-light min-w-[28px] text-right">
        {volumePercentage}%
      </span>
    </div>
  );
};

export default VolumeControl;
