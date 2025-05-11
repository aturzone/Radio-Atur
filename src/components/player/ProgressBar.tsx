
import { useState } from "react";
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
  const [isDragging, setIsDragging] = useState(false);
  const [localValue, setLocalValue] = useState<number>(0);
  
  // Format time for display
  const formatTime = (time: number) => {
    if (time === 0 || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  };
  
  // Handle slider drag start
  const handleDragStart = () => {
    setIsDragging(true);
    setLocalValue(currentTime);
  };
  
  // Handle value change during drag
  const handleValueChange = (value: number[]) => {
    const newValue = value[0];
    setLocalValue(newValue);
  };
  
  // Handle slider drag end - ensure we call onTimeChange
  const handleDragEnd = () => {
    // Important: We must update with the local value that was being dragged
    onTimeChange([localValue]);
    setIsDragging(false);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray dark:text-gray-300">
        {formatTime(isDragging ? localValue : currentTime)}
      </span>
      <Slider 
        value={isDragging ? [localValue] : [currentTime]} 
        min={0} 
        max={duration || 100}
        step={0.1}
        className="flex-1" 
        onValueChange={handleValueChange}
        onPointerDown={handleDragStart}
        onPointerUp={handleDragEnd}
      />
      <span className="text-xs text-gray dark:text-gray-300">
        {formatTime(duration)}
      </span>
    </div>
  );
};

export default ProgressBar;
