
import React from 'react';
import { Button } from '@/components/ui/button';
import { Cloud, LogIn } from 'lucide-react';
import { useGoogleIntegration } from '../contexts/GoogleIntegrationContext';

const GoogleDriveConnect: React.FC = () => {
  const { isConnected, isConnecting, userName, userEmail, connect } = useGoogleIntegration();

  const handleConnect = async () => {
    // Trigger the "open-google-drive-panel" event to switch to the Google Drive panel in settings
    if (isConnected) {
      document.dispatchEvent(new CustomEvent('open-google-drive-panel'));
    } else {
      await connect();
    }
  };

  return (
    <div className="p-3 border rounded-lg my-4 bg-background/70">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-coffee" />
          <div>
            <h3 className="font-medium">Google Drive</h3>
            {isConnected ? (
              <p className="text-sm text-gray-500">{userName || userEmail}</p>
            ) : (
              <p className="text-sm text-gray-500">Not connected</p>
            )}
          </div>
        </div>
        
        <Button 
          variant={isConnected ? "outline" : "default"} 
          onClick={handleConnect} 
          disabled={isConnecting}
          className="flex items-center gap-2"
        >
          {isConnected ? (
            "Manage Sync"
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              {isConnecting ? 'Connecting...' : 'Connect'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default GoogleDriveConnect;
