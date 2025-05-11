
import { Slider } from "@/components/ui/slider";

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onTimeChange: (value: number[]) => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentTime,
  duration,
  onTimeChange
}) => {
  // Format time for display
  const formatTime = (time: number) => {
    if (time === 0 || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray dark:text-gray-300">{formatTime(currentTime)}</span>
      <Slider 
        value={[currentTime]} 
        min={0} 
        max={duration || 100}
        step={0.1}
        className="flex-1" 
        onValueChange={onTimeChange}
      />
      <span className="text-xs text-gray dark:text-gray-300">{formatTime(duration)}</span>
    </div>
  );
};

export default ProgressBar;
