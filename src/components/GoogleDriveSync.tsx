
import React, { useState, useEffect } from 'react';
import { CloudIcon, Download, Upload, RotateCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useGoogleIntegration } from '../contexts/GoogleIntegrationContext';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

const GoogleDriveSync: React.FC = () => {
  const { isConnected, isConnecting, connect, disconnect, lastSyncDate, syncData } = useGoogleIntegration();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleConnect = async () => {
    try {
      await connect();
      toast.success('Connected to Google Drive!');
    } catch (err) {
      toast.error('Failed to connect to Google Drive');
      console.error('Connection error:', err);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast.success('Disconnected from Google Drive');
    } catch (err) {
      toast.error('Failed to disconnect from Google Drive');
      console.error('Disconnect error:', err);
    }
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      await syncData();
      toast.success('Sync completed successfully!');
    } catch (err) {
      toast.error('Sync failed');
      console.error('Sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Format the last sync date
  const formatLastSync = () => {
    if (!lastSyncDate) return 'Never';
    
    const date = new Date(lastSyncDate);
    return date.toLocaleString();
  };

  return (
    <ScrollArea className="h-full max-h-[350px]">
      <div className="space-y-4 mt-4 pr-3">
        <div className="flex items-center justify-between bg-background/5 p-2 rounded-lg">
          <div className="flex items-center gap-2">
            <CloudIcon className="h-5 w-5 text-coffee" />
            <span className="font-medium">Google Drive Sync</span>
          </div>
          {isConnected ? (
            <Badge variant="outline" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
              Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-500/10 text-gray-500 hover:bg-gray-500/20">
              Disconnected
            </Badge>
          )}
        </div>

        {isConnected ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Last sync:</span>
              <span>{formatLastSync()}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={handleSync}
                disabled={isSyncing}
              >
                {isSyncing ? <RotateCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                <span>Sync Now</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={handleDisconnect}
              >
                <CloudIcon className="h-4 w-4" />
                <span>Disconnect</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Alert variant="default" className="bg-amber-500/10 border-amber-500/30">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertTitle className="text-amber-500">Not connected</AlertTitle>
              <AlertDescription className="text-gray-600 dark:text-gray-400 text-sm">
                Connect to Google Drive to sync your playlists and settings across devices.
              </AlertDescription>
            </Alert>
            
            <Button 
              variant="outline"
              className="w-full flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={handleConnect}
              disabled={isConnecting}
            >
              <CloudIcon className="h-4 w-4 text-coffee" />
              <span>Connect to Google Drive</span>
            </Button>
          </div>
        )}

        <Separator className="my-3" />
        
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>
            Connecting to Google Drive allows you to:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Sync your playlists across devices</li>
            <li>Back up your library automatically</li>
            <li>Access your music from anywhere</li>
          </ul>
        </div>
      </div>
    </ScrollArea>
  );
};

export default GoogleDriveSync;
