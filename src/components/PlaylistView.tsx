
import React, { useState } from 'react';
import { Folder, musicLibrary, Track } from '../data/sampleTracks';
import PlaylistFolder from './PlaylistFolder';
import { ChevronRight } from 'lucide-react';

interface PlaylistViewProps {
  onTrackSelect: (track: Track) => void;
  currentTrackId: string | null;
}

const PlaylistView: React.FC<PlaylistViewProps> = ({ onTrackSelect, currentTrackId }) => {
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['jazz']);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFolder = (folderId: string) => {
    if (expandedFolders.includes(folderId)) {
      setExpandedFolders(expandedFolders.filter(id => id !== folderId));
    } else {
      setExpandedFolders([...expandedFolders, folderId]);
    }
  };

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

  const filterLibrary = (query: string): Folder[] => {
    if (!query.trim()) return musicLibrary;
    
    const filteredLibrary: Folder[] = [];
    
    // Helper function to search for tracks in a folder
    const searchFolder = (folder: Folder): Folder | null => {
      const matchingTracks = folder.tracks.filter(
        track => 
          track.title.toLowerCase().includes(query.toLowerCase()) || 
          track.artist.toLowerCase().includes(query.toLowerCase())
      );
      
      const matchingFolders = folder.folders
        .map(searchFolder)
        .filter((f): f is Folder => f !== null);
      
      if (matchingTracks.length > 0 || matchingFolders.length > 0 || 
          folder.name.toLowerCase().includes(query.toLowerCase())) {
        return {
          ...folder,
          tracks: matchingTracks,
          folders: matchingFolders
        };
      }
      
      return null;
    };
    
    // Search all root folders
    musicLibrary.forEach(folder => {
      const filteredFolder = searchFolder(folder);
      if (filteredFolder) filteredLibrary.push(filteredFolder);
    });
    
    return filteredLibrary;
  };
  
  const filteredLibrary = filterLibrary(searchQuery);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search music..."
          className="w-full px-4 py-2 rounded-lg bg-gray-light/30 border border-gray-light focus:outline-none focus:border-coffee"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>
      
      {renderPath()}
      
      <div className="mt-4 overflow-y-auto flex-1 pr-2 -mr-2">
        {filteredLibrary.length === 0 ? (
          <div className="text-center py-8 text-gray">
            <p>No music found matching "{searchQuery}"</p>
          </div>
        ) : (
          filteredLibrary.map((folder) => (
            <PlaylistFolder
              key={folder.id}
              folder={folder}
              onTrackSelect={onTrackSelect}
              currentTrackId={currentTrackId || undefined}
              expandedFolders={expandedFolders}
              onFolderToggle={toggleFolder}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default PlaylistView;
