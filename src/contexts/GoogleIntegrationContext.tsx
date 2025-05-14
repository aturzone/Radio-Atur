
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';
import {
  authenticate,
  isAuthenticated,
  signOut,
  getGmailProfile,
  syncToGoogleDrive,
  backupToGoogleDrive,
  restoreFromBackup,
  listBackups,
  loadGoogleApis
} from '../utils/googleIntegration';
import { 
  Track, 
  Folder, 
  RadioChannel, 
  radioChannels, 
  findTrackById,
  getFolderPath,
  shuffleArray,
  musicLibrary
} from '../data/sampleTracks';

// Interface for Google Integration Context
interface GoogleIntegrationContextProps {
  isConnected: boolean;
  isConnecting: boolean;
  userName: string | null;
  userEmail: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  syncLibrary: () => Promise<void>;
  backupLibrary: () => Promise<void>;
  restoreLibrary: (backupId: string) => Promise<void>;
  listAvailableBackups: () => Promise<Array<{ id: string, name: string, date: string }>>;
  lastSyncDate: string | null;
  syncData: () => Promise<void>;
  // Add the missing properties
  isLoading: boolean;
  playlists: Folder[];
  scanDriveForMusic: () => Promise<void>;
}

// Create context with default values
const GoogleIntegrationContext = createContext<GoogleIntegrationContextProps>({
  isConnected: false,
  isConnecting: false,
  userName: null,
  userEmail: null,
  connect: async () => {},
  disconnect: async () => {},
  syncLibrary: async () => {},
  backupLibrary: async () => {},
  restoreLibrary: async () => {},
  listAvailableBackups: async () => [],
  lastSyncDate: null,
  syncData: async () => {},
  // Add default values for the missing properties
  isLoading: false,
  playlists: [],
  scanDriveForMusic: async () => {}
});

// Context provider component
export const GoogleIntegrationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [lastSyncDate, setLastSyncDate] = useState<string | null>(
    localStorage.getItem('lastGoogleSyncDate')
  );
  // Add state for the new properties
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [playlists, setPlaylists] = useState<Folder[]>([]);

  // Check connection status on load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        await loadGoogleApis();
        const authStatus = isAuthenticated();
        setIsConnected(authStatus);
        
        if (authStatus) {
          try {
            const profile = await getGmailProfile();
            setUserName(profile.name);
            setUserEmail(profile.email);
          } catch (error) {
            console.error('Error fetching profile:', error);
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };
    
    checkAuthStatus();
  }, []);

  // Connect to Google
  const connect = useCallback(async () => {
    try {
      setIsConnecting(true);
      await authenticate();
      setIsConnected(true);
      
      // Get user info
      const profile = await getGmailProfile();
      setUserName(profile.name);
      setUserEmail(profile.email);
      
      toast.success('Connected to Google Drive!');
    } catch (error) {
      console.error('Google connection error:', error);
      toast.error('Failed to connect to Google Drive');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Disconnect from Google
  const disconnect = useCallback(async () => {
    try {
      signOut();
      setIsConnected(false);
      setUserName(null);
      setUserEmail(null);
      toast.success('Disconnected from Google Drive');
    } catch (error) {
      console.error('Google disconnection error:', error);
      toast.error('Failed to disconnect from Google Drive');
    }
  }, []);

  // Sync library to Google Drive
  const syncLibrary = useCallback(async () => {
    try {
      if (!isConnected) {
        await connect();
      }
      
      await syncToGoogleDrive(musicLibrary);
      const now = new Date().toISOString();
      setLastSyncDate(now);
      localStorage.setItem('lastGoogleSyncDate', now);
      
      toast.success('Your music has been synced to Google Drive');
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Failed to sync your library');
    }
  }, [isConnected, connect]);

  // Backup library to Google Drive
  const backupLibrary = useCallback(async () => {
    try {
      if (!isConnected) {
        await connect();
      }
      
      await backupToGoogleDrive(musicLibrary);
      const now = new Date().toISOString();
      setLastSyncDate(now);
      localStorage.setItem('lastGoogleSyncDate', now);
      
      toast.success('Your music library has been backed up to Google Drive');
    } catch (error) {
      console.error('Backup error:', error);
      toast.error('Failed to backup your library');
    }
  }, [isConnected, connect]);

  // List available backups
  const listAvailableBackups = useCallback(async () => {
    try {
      if (!isConnected) {
        await connect();
      }
      
      return await listBackups();
    } catch (error) {
      console.error('List backups error:', error);
      toast.error('Failed to list available backups');
      return [];
    }
  }, [isConnected, connect]);

  // Restore library from backup
  const restoreLibrary = useCallback(async (backupId: string) => {
    try {
      if (!isConnected) {
        await connect();
      }
      
      await restoreFromBackup(backupId);
      const now = new Date().toISOString();
      setLastSyncDate(now);
      localStorage.setItem('lastGoogleSyncDate', now);
      
      toast.success('Your music library has been restored from backup');
    } catch (error) {
      console.error('Restore error:', error);
      toast.error('Failed to restore your library from backup');
    }
  }, [isConnected, connect]);

  // General sync function for data
  const syncData = useCallback(async () => {
    try {
      if (!isConnected) {
        await connect();
      }
      
      await syncLibrary();
    } catch (error) {
      console.error('Data sync error:', error);
      toast.error('Failed to sync data');
    }
  }, [isConnected, connect, syncLibrary]);

  // Add the scanDriveForMusic function
  const scanDriveForMusic = useCallback(async () => {
    try {
      if (!isConnected) {
        await connect();
      }

      setIsLoading(true);
      // Simulate scanning Google Drive for music files
      // In a real implementation, this would call an API to scan Google Drive
      
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate loading time
      
      // Mock playlists found in Google Drive
      const mockPlaylists: Folder[] = [
        {
          id: 'gdrive-folder-1',
          name: 'Google Drive Music',
          tracks: [
            {
              id: 'gdrive-track-1',
              title: 'Cloud Song 1',
              artist: 'Cloud Artist',
              duration: '3:24',
              url: '',
              cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300'
            },
            {
              id: 'gdrive-track-2',
              title: 'Cloud Song 2',
              artist: 'Cloud Artist',
              duration: '4:12',
              url: '',
              cover: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=300'
            }
          ],
          folders: []
        },
        {
          id: 'gdrive-folder-2',
          name: 'Shared Music',
          tracks: [
            {
              id: 'gdrive-track-3',
              title: 'Shared Song 1',
              artist: 'Various Artists',
              duration: '2:55',
              url: '',
              cover: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300'
            }
          ],
          folders: []
        }
      ];
      
      setPlaylists(mockPlaylists);
      toast.success('Found music files in Google Drive');
    } catch (error) {
      console.error('Error scanning Google Drive:', error);
      toast.error('Failed to scan Google Drive for music');
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, connect]);

  return (
    <GoogleIntegrationContext.Provider
      value={{
        isConnected,
        isConnecting,
        userName,
        userEmail,
        connect,
        disconnect,
        syncLibrary,
        backupLibrary,
        restoreLibrary,
        listAvailableBackups,
        lastSyncDate,
        syncData,
        // Add the new properties to the provider value
        isLoading,
        playlists,
        scanDriveForMusic
      }}
    >
      {children}
    </GoogleIntegrationContext.Provider>
  );
};

// Custom hook for using Google Integration context
export const useGoogleIntegration = () => {
  const context = useContext(GoogleIntegrationContext);
  if (!context) {
    throw new Error('useGoogleIntegration must be used within a GoogleIntegrationProvider');
  }
  return context;
};

// Re-export types for convenience
export type { Track, Folder, RadioChannel };
export { radioChannels };
