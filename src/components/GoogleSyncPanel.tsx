
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { CalendarDays, Cloud, Download, Upload, RefreshCw, LogIn } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useGoogleIntegration } from '../contexts/GoogleIntegrationContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const GoogleSyncPanel = () => {
  const {
    isConnected,
    isConnecting,
    userName,
    userEmail,
    connect,
    disconnect,
    backupLibrary,
    restoreLibrary,
    syncLibrary,
    listAvailableBackups
  } = useGoogleIntegration();

  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const [availableBackups, setAvailableBackups] = useState<Array<{ id: string, name: string, date: string }>>([]);
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);
  const [selectedBackupId, setSelectedBackupId] = useState<string | null>(null);

  // Load available backups when dialog opens
  const handleOpenRestoreDialog = async () => {
    try {
      setIsLoadingBackups(true);
      const backups = await listAvailableBackups();
      setAvailableBackups(backups);
      setSelectedBackupId(backups.length > 0 ? backups[0].id : null);
    } catch (error) {
      console.error('Error loading backups:', error);
    } finally {
      setIsLoadingBackups(false);
      setIsRestoreDialogOpen(true);
    }
  };

  // Format the date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  // Extract date from backup name
  const extractDateFromName = (name: string) => {
    const match = name.match(/Backup_(\d{4}-\d{2}-\d{2}_\d{2}-\d{2})/);
    return match ? match[1].replace('_', ' ').replace('-', ':') : 'Unknown date';
  };

  // Handle restore
  const handleRestore = async () => {
    if (!selectedBackupId) {
      toast.error('Please select a backup to restore');
      return;
    }

    try {
      await restoreLibrary(selectedBackupId);
      setIsRestoreDialogOpen(false);
    } catch (error) {
      console.error('Error during restore:', error);
    }
  };

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Google Sync
          </CardTitle>
          <CardDescription>
            Sync your music library with Google Drive
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border">
                  {userEmail && (
                    <AvatarImage 
                      src={`https://www.gravatar.com/avatar/${Buffer.from(userEmail.trim().toLowerCase()).toString('hex')}?d=mp`} 
                      alt={userName || userEmail} 
                    />
                  )}
                  <AvatarFallback>{userName?.charAt(0) || userEmail?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">{userName || 'User'}</span>
                  <span className="text-sm text-gray-500">{userEmail}</span>
                </div>
              </div>

              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={syncLibrary}
                >
                  <RefreshCw className="h-4 w-4" />
                  Sync to Drive
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={backupLibrary}
                >
                  <Upload className="h-4 w-4" />
                  Backup All
                </Button>
              </div>

              <Button 
                variant="outline" 
                className="w-full flex items-center gap-2"
                onClick={handleOpenRestoreDialog}
              >
                <Download className="h-4 w-4" />
                Import Backup
              </Button>

              <div className="text-sm text-gray-500 mt-4">
                <p>Your music is synced to Google Drive in the "CozyAudioCafe_Music" folder.</p>
                <p className="mt-1">Full backups are stored in "CozyAudioCafe_Backups".</p>
              </div>
              
              <Button 
                variant="ghost" 
                className="text-sm text-gray-500 mt-2 w-full"
                onClick={disconnect}
              >
                Sign out from Google
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center py-6">
              <Cloud className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium mb-2">Connect with Google</h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                Sign in with your Google account to sync and backup your music library to Google Drive
              </p>
              <Button 
                className="flex items-center gap-2" 
                onClick={connect} 
                disabled={isConnecting}
              >
                <LogIn className="h-4 w-4" />
                {isConnecting ? 'Connecting...' : 'Sign in with Google'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Import Backup</DialogTitle>
            <DialogDescription>
              Select a backup to restore your music library and settings
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingBackups ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-coffee" />
            </div>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              {availableBackups.length === 0 ? (
                <div className="text-center py-8">
                  <p>No backups found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableBackups.map(backup => (
                    <div 
                      key={backup.id}
                      className={`p-3 rounded-md border cursor-pointer transition-colors
                        ${selectedBackupId === backup.id 
                          ? 'bg-coffee/10 border-coffee' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                      onClick={() => setSelectedBackupId(backup.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">
                          {backup.name.startsWith('Backup_') 
                            ? `Backup ${backup.name.replace('Backup_', '')}` 
                            : backup.name}
                        </div>
                        <CalendarDays className="h-4 w-4 text-gray-500" />
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {formatDate(backup.date)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRestoreDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRestore} 
              disabled={!selectedBackupId || isLoadingBackups}
            >
              Restore
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GoogleSyncPanel;
