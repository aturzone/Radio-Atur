
import React, { useState } from 'react';
import { ChevronRight, FolderPlus, Upload, Search } from 'lucide-react';
import PlaylistFolder from './PlaylistFolder';
import { Track } from '../data/sampleTracks';
import { usePlaylist } from '../contexts/PlaylistContext';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from '@/components/ui/separator';

interface PlaylistViewProps {
  onTrackSelect: (track: Track) => void;
  currentTrackId: string | null;
}

const PlaylistView: React.FC<PlaylistViewProps> = ({ onTrackSelect, currentTrackId }) => {
  const { library, isScanning, scanForMusic } = usePlaylist();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [fileInput, setFileInput] = useState<HTMLInputElement | null>(null);

  // Filter out the radio stations folder from the library
  const filteredLibrary = library.filter(folder => folder.id !== 'radio-stations-folder');

  // Path display for current view (we'll only use root level for simplicity)
  const renderPath = () => (
    <div className="flex items-center text-sm text-coffee pb-2 border-b border-gray-light/70">
      <span className="font-medium">Music Library</span>
      <ChevronRight className="h-3 w-3 mx-1" />
      <span className="text-coffee-dark">All Playlists</span>
    </div>
  );

  // Search functionality
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filterLibrary = (query: string) => {
    if (!query.trim()) return filteredLibrary;
    
    const searchedLibrary = [];
    
    // Helper function to search for tracks in a folder
    const searchFolder = (folder: typeof library[0]) => {
      const matchingTracks = folder.tracks.filter(
        track => 
          track.title.toLowerCase().includes(query.toLowerCase()) || 
          track.artist.toLowerCase().includes(query.toLowerCase())
      );
      
      const matchingFolders = folder.folders
        .map(searchFolder)
        .filter(f => f !== null);
      
      if (matchingTracks.length > 0 || matchingFolders.length > 0 || 
          folder.name.toLowerCase().includes(query.toLowerCase())) {
        return {
          ...folder,
          tracks: matchingTracks,
          folders: matchingFolders as typeof folder.folders
        };
      }
      
      return null;
    };
    
    // Search all filtered folders
    filteredLibrary.forEach(folder => {
      const filteredFolder = searchFolder(folder);
      if (filteredFolder) searchedLibrary.push(filteredFolder);
    });
    
    return searchedLibrary;
  };
  
  const searchResults = filterLibrary(searchQuery);
  
  const handleNewRootFolder = () => {
    if (!newFolderName.trim()) {
      toast.error("Folder name can't be empty");
      return;
    }
    
    // Create new root folder
    const newFolder = {
      id: crypto.randomUUID(),
      name: newFolderName,
      tracks: [],
      folders: []
    };
    
    // Add to library
    const updatedLibrary = [...library, newFolder];
    
    // Update context (assuming your context has a setLibrary function)
    // For the example, we're using the mock data
    // setLibrary(updatedLibrary);
    
    toast.success(`Created new folder "${newFolderName}"`);
    setNewFolderName("");
    setIsCreateFolderOpen(false);
  };

  // File upload handling
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    toast.info(`Processing ${files.length} files...`);
    
    try {
      await scanForMusic(files);
      toast.success(`Added ${files.length} audio files`);
    } catch (error) {
      console.error('Error processing files:', error);
      toast.error('Failed to process files');
    }
    
    // Reset input value so the same files can be selected again
    if (fileInput) fileInput.value = '';
  };
  
  const triggerFileUpload = () => {
    if (!fileInput) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'audio/*';
      input.multiple = true;
      input.onchange = handleFileUpload as any;
      setFileInput(input);
      input.click();
    } else {
      fileInput.click();
    }
  };

  const handleScanClick = () => {
    scanForMusic();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search music..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-light/30 border border-gray-light focus:outline-none focus:border-coffee"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-3">
        {renderPath()}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs h-7 px-2 flex items-center gap-1"
            >
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setIsCreateFolderOpen(true)}>
              <FolderPlus className="mr-2 h-4 w-4" />
              <span>New Folder</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={triggerFileUpload}>
              <Upload className="mr-2 h-4 w-4" />
              <span>Upload Music</span>
            </DropdownMenuItem>
            
            <Separator className="my-1" />
            
            <DropdownMenuItem 
              onClick={handleScanClick}
              disabled={isScanning}
            >
              <Search className={`mr-2 h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning...' : 'Scan Device'}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Create root folder dialog */}
      <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create new folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newFolderName.trim()) {
                  handleNewRootFolder();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleNewRootFolder} disabled={!newFolderName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className="mt-4 overflow-y-auto flex-1 pr-2 -mr-2">
        {searchResults.length === 0 ? (
          <div className="text-center py-8 text-gray">
            <p>No music found matching "{searchQuery}"</p>
          </div>
        ) : (
          searchResults.map((folder) => (
            <PlaylistFolder
              key={folder.id}
              folder={folder}
              onTrackSelect={onTrackSelect}
              currentTrackId={currentTrackId || undefined}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default PlaylistView;
