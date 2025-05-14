
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Folder, Track } from '../data/sampleTracks';
import { usePlaylist } from '../contexts/PlaylistContext';
import { useGoogleIntegration } from '../contexts/GoogleIntegrationContext';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Music, RefreshCw, FolderOpen } from 'lucide-react';

const GoogleDriveMusicSync: React.FC = () => {
  const { isConnected, isLoading, playlists, scanDriveForMusic } = useGoogleIntegration();
  const { importPlaylists } = usePlaylist();
  const [selectedPlaylists, setSelectedPlaylists] = useState<Record<string, boolean>>({});
  const [isImporting, setIsImporting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Reset selection when playlists change
  useEffect(() => {
    if (playlists.length > 0) {
      const initialSelection = playlists.reduce<Record<string, boolean>>((acc, playlist) => {
        acc[playlist.id] = false;
        return acc;
      }, {});
      setSelectedPlaylists(initialSelection);
    }
  }, [playlists]);

  const handleSelectAll = (selected: boolean) => {
    const newSelection = { ...selectedPlaylists };
    Object.keys(newSelection).forEach(key => {
      newSelection[key] = selected;
    });
    setSelectedPlaylists(newSelection);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedPlaylists(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleImport = async () => {
    const selectedIds = Object.entries(selectedPlaylists)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => id);
    
    if (selectedIds.length === 0) {
      toast.error("Please select at least one playlist to import");
      return;
    }
    
    setIsImporting(true);
    try {
      const playlistsToImport = playlists.filter(playlist => selectedIds.includes(playlist.id));
      importPlaylists(playlistsToImport);
      toast.success(`Successfully imported ${selectedIds.length} playlist(s)`);
      // Reset selection after import
      handleSelectAll(false);
    } catch (error) {
      console.error("Error importing playlists:", error);
      toast.error("Failed to import playlists");
    } finally {
      setIsImporting(false);
    }
  };

  const handleScan = async () => {
    setIsScanning(true);
    try {
      await scanDriveForMusic();
      toast.success("Google Drive scanned successfully");
    } catch (error) {
      console.error("Error scanning Google Drive:", error);
      toast.error("Failed to scan Google Drive");
    } finally {
      setIsScanning(false);
    }
  };

  const countSelectedPlaylists = () => {
    return Object.values(selectedPlaylists).filter(Boolean).length;
  };

  const countSelectedTracks = () => {
    return playlists
      .filter(playlist => selectedPlaylists[playlist.id])
      .reduce((total, playlist) => {
        const trackCount = countPlaylistTracks(playlist);
        return total + trackCount;
      }, 0);
  };

  const countPlaylistTracks = (folder: Folder): number => {
    let count = folder.tracks.length;
    
    folder.folders.forEach(subFolder => {
      count += countPlaylistTracks(subFolder);
    });
    
    return count;
  };

  if (!isConnected) {
    return (
      <div className="text-center p-4">
        <Music className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">Google Drive Music Sync</h3>
        <p className="text-gray-500 mb-4">
          Connect your Google Drive to sync your music library.
        </p>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Music className="h-5 w-5" /> 
          Google Drive Music
        </h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleScan} 
          disabled={isScanning}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
          {isScanning ? 'Scanning...' : 'Scan Drive'}
        </Button>
      </div>
      
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-[80px] w-full rounded-md" />
          <Skeleton className="h-[80px] w-full rounded-md" />
          <Skeleton className="h-[80px] w-full rounded-md" />
        </div>
      ) : playlists.length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-3 text-sm">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="select-all" 
                onCheckedChange={(checked) => handleSelectAll(checked === true)}
              />
              <label htmlFor="select-all" className="text-muted-foreground cursor-pointer">
                Select All
              </label>
            </div>
            <span className="text-muted-foreground">
              {countSelectedPlaylists()} playlist(s), {countSelectedTracks()} track(s) selected
            </span>
          </div>
          
          <ScrollArea className="h-[300px] pr-4 -mr-4">
            <div className="space-y-3">
              {playlists.map((playlist) => (
                <div 
                  key={playlist.id} 
                  className={`border rounded-md p-3 transition-colors ${selectedPlaylists[playlist.id] ? 'border-primary bg-primary/5' : 'border-border'}`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      id={`playlist-${playlist.id}`}
                      checked={selectedPlaylists[playlist.id] || false}
                      onCheckedChange={() => handleToggleSelect(playlist.id)}
                    />
                    <div className="flex-shrink-0 w-12 h-12 overflow-hidden rounded-md">
                      <AspectRatio ratio={1/1} className="bg-muted">
                        <div className="flex items-center justify-center w-full h-full bg-primary/10 text-primary">
                          <FolderOpen className="h-6 w-6" />
                        </div>
                      </AspectRatio>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{playlist.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {countPlaylistTracks(playlist)} tracks
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="mt-4 flex justify-end">
            <Button 
              onClick={handleImport} 
              disabled={isImporting || countSelectedPlaylists() === 0}
            >
              {isImporting ? 'Importing...' : 'Import Selected Playlists'}
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-8 border border-dashed rounded-md">
          <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-3" />
          <p className="text-muted-foreground">No music playlists found in your Google Drive</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-3"
            onClick={handleScan}
            disabled={isScanning}
          >
            {isScanning ? 'Scanning...' : 'Scan for Music'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default GoogleDriveMusicSync;
