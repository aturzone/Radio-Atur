
import React, { useState } from 'react';
import { usePlaylist } from '../contexts/PlaylistContext';
import { toast } from 'sonner';
import { 
  createBackup, 
  restoreBackup, 
  pickBackupFile, 
  pickExportDirectory 
} from '../utils/backupSystem';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Archive,
  Download,
  Upload,
  Folder,
  Settings,
  Check,
  Save
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface BackupRestorePanelProps {
  className?: string;
}

const BackupRestorePanel: React.FC<BackupRestorePanelProps> = ({ className = "" }) => {
  const { library, setLibrary } = usePlaylist();
  
  // State for dialogs
  const [isBackupDialogOpen, setIsBackupDialogOpen] = useState(false);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  
  // State for backup options
  const [includeAudioFiles, setIncludeAudioFiles] = useState(true);
  const [includePlaylists, setIncludePlaylists] = useState(true);
  const [includeCovers, setIncludeCovers] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  
  // State for backup/restore operations
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportPath, setExportPath] = useState<string | null>(null);
  const [backupFilePath, setBackupFilePath] = useState<string | null>(null);
  
  // Handle backup creation
  const handleCreateBackup = async () => {
    setIsProcessing(true);
    setProgress(10);
    
    try {
      // If no export path selected, prompt user
      const path = exportPath || await pickExportDirectory();
      if (!path) {
        toast.error("No export location selected");
        setIsProcessing(false);
        return;
      }
      
      setExportPath(path);
      setProgress(30);
      
      // Create the backup
      const result = await createBackup(library, path, {
        includeAudioFiles,
        includePlaylists,
        includeCovers,
        includeMetadata
      });
      
      setProgress(100);
      
      if (result.success) {
        toast.success(`Backup created: ${result.path}`);
        setIsBackupDialogOpen(false);
      } else {
        toast.error(`Backup failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Error creating backup:", error);
      toast.error("Backup failed due to an unexpected error");
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };
  
  // Handle backup restoration
  const handleRestoreBackup = async () => {
    setIsProcessing(true);
    setProgress(10);
    
    try {
      // If no backup file selected, prompt user
      const filePath = backupFilePath || await pickBackupFile();
      if (!filePath) {
        toast.error("No backup file selected");
        setIsProcessing(false);
        return;
      }
      
      setBackupFilePath(filePath);
      setProgress(30);
      
      // Restore the backup
      const result = await restoreBackup(filePath);
      
      setProgress(100);
      
      if (result.success && result.library) {
        setLibrary(result.library);
        toast.success("Backup restored successfully");
        setIsRestoreDialogOpen(false);
      } else {
        toast.error(`Restore failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Error restoring backup:", error);
      toast.error("Restore failed due to an unexpected error");
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };
  
  // Handle selecting export directory
  const handleSelectExportPath = async () => {
    const path = await pickExportDirectory();
    if (path) {
      setExportPath(path);
      toast.info(`Export location: ${path}`);
    }
  };
  
  // Handle selecting backup file
  const handleSelectBackupFile = async () => {
    const filePath = await pickBackupFile();
    if (filePath) {
      setBackupFilePath(filePath);
      toast.info(`Selected backup: ${filePath}`);
    }
  };
  
  return (
    <div className={`backup-restore-panel ${className}`}>
      <div className="flex flex-col gap-4 p-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Archive className="h-5 w-5" />
          Backup & Restore
        </h2>
        
        <div className="flex flex-col gap-2">
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => setIsBackupDialogOpen(true)}
          >
            <Save className="h-4 w-4 mr-2" />
            Create Backup
          </Button>
          
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => setIsRestoreDialogOpen(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Restore Backup
          </Button>
        </div>
      </div>
      
      {/* Create Backup Dialog */}
      <Dialog open={isBackupDialogOpen} onOpenChange={setIsBackupDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Backup</DialogTitle>
            <DialogDescription>
              Create a backup of your music library, playlists, and settings.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <h3 className="font-medium">Include in backup:</h3>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="audio-files" 
                  checked={includeAudioFiles} 
                  onCheckedChange={(checked) => setIncludeAudioFiles(checked === true)}
                />
                <label htmlFor="audio-files" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Audio Files
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="playlists" 
                  checked={includePlaylists} 
                  onCheckedChange={(checked) => setIncludePlaylists(checked === true)}
                />
                <label htmlFor="playlists" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Playlists
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="covers" 
                  checked={includeCovers} 
                  onCheckedChange={(checked) => setIncludeCovers(checked === true)}
                />
                <label htmlFor="covers" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Album Covers
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="metadata" 
                  checked={includeMetadata} 
                  onCheckedChange={(checked) => setIncludeMetadata(checked === true)}
                />
                <label htmlFor="metadata" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Track Metadata
                </label>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Button 
                  variant="secondary" 
                  onClick={handleSelectExportPath} 
                  disabled={isProcessing}
                >
                  <Folder className="h-4 w-4 mr-2" />
                  Select Export Location
                </Button>
                {exportPath && (
                  <span className="text-sm text-muted-foreground">
                    {exportPath}
                  </span>
                )}
              </div>
            </div>
            
            {isProcessing && (
              <Progress value={progress} className="w-full" />
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsBackupDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateBackup}
              disabled={isProcessing || (!includeAudioFiles && !includePlaylists && !includeCovers && !includeMetadata)}
            >
              {isProcessing ? "Creating..." : "Create Backup"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Restore Backup Dialog */}
      <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Restore Backup</DialogTitle>
            <DialogDescription>
              Restore your music library from a backup file.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Button 
                  variant="secondary" 
                  onClick={handleSelectBackupFile} 
                  disabled={isProcessing}
                >
                  <Folder className="h-4 w-4 mr-2" />
                  Select Backup File
                </Button>
                {backupFilePath && (
                  <span className="text-sm text-muted-foreground">
                    {backupFilePath}
                  </span>
                )}
              </div>
            </div>
            
            {isProcessing && (
              <Progress value={progress} className="w-full" />
            )}
            
            <div className="flex flex-col gap-2 text-sm text-muted-foreground border-t pt-2">
              <p className="font-medium text-destructive">Warning:</p>
              <p>Restoring a backup will replace your current library and playlists.</p>
              <p>Make sure to create a backup of your current data first if needed.</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsRestoreDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              variant="default"
              onClick={handleRestoreBackup}
              disabled={isProcessing || !backupFilePath}
            >
              {isProcessing ? "Restoring..." : "Restore Backup"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BackupRestorePanel;
