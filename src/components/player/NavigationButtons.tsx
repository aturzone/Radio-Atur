
import { Link } from 'react-router-dom';
import { Radio, Music, Settings, Archive } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from 'react';
import BackupRestorePanel from '../BackupRestorePanel';

interface NavigationButtonsProps {
  className?: string;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({ className = "" }) => {
  const [isBackupDialogOpen, setIsBackupDialogOpen] = useState(false);
  
  return (
    <div className={`flex justify-end gap-2 ${className}`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to="/radio"
              className="p-1 rounded-md bg-coffee/10 hover:bg-gray-light/50 dark:hover:bg-gray-700/50 text-coffee-dark dark:text-coffee-light transition flex items-center gap-1 hover:scale-110 duration-200"
              aria-label="Go to radio"
            >
              <Radio size={20} className="icon-bounce" />
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>Radio Stations</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to="/music-library"
              className="p-1 rounded-md hover:bg-gray-light/50 dark:hover:bg-gray-700/50 text-coffee-dark dark:text-coffee-light transition hover:scale-110 duration-200"
              aria-label="View music library"
            >
              <Music size={20} />
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>Music Library</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="p-1 rounded-md hover:bg-gray-light/50 dark:hover:bg-gray-700/50 text-coffee-dark dark:text-coffee-light transition hover:scale-110 duration-200"
              aria-label="Backup & Restore"
              onClick={() => setIsBackupDialogOpen(true)}
            >
              <Archive size={20} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Backup & Restore</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to="/settings"
              className="p-1 rounded-md hover:bg-gray-light/50 dark:hover:bg-gray-700/50 text-coffee-dark dark:text-coffee-light transition hover:scale-110 duration-200"
              aria-label="Settings"
            >
              <Settings size={20} />
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>Settings</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Backup & Restore Dialog */}
      <Dialog open={isBackupDialogOpen} onOpenChange={setIsBackupDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Backup & Restore</DialogTitle>
          </DialogHeader>
          <BackupRestorePanel />
        </DialogContent>
      </Dialog>

      {/* Google Drive Coming Soon notice */}
      <div className="hidden">
        <div className="text-center p-4">
          <h3 className="text-lg font-bold">🔒 Google Sync — Coming Soon!</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Cloud syncing will be available in a future version.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NavigationButtons;
