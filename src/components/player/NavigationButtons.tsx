
import { Link } from 'react-router-dom';
import { Radio, Music } from 'lucide-react';

interface NavigationButtonsProps {
  className?: string;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({ className = "" }) => {
  return (
    <div className={`flex justify-end gap-2 ${className}`}>
      <Link
        to="/radio"
        className="p-1 rounded-md hover:bg-gray-light/50 dark:hover:bg-gray-700/50 text-coffee-dark dark:text-coffee-light transition flex items-center gap-1"
        aria-label="Go to radio"
      >
        <Radio size={20} className="animate-pulse" />
      </Link>
      <button
        className="p-1 rounded-md hover:bg-gray-light/50 dark:hover:bg-gray-700/50 text-coffee-dark dark:text-coffee-light transition"
        aria-label="View music library"
      >
        <Music size={20} />
      </button>
    </div>
  );
};

export default NavigationButtons;
