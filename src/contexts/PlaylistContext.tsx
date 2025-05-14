
import { createContext, useContext, useState, useEffect } from 'react';
import { Folder, Track, sampleLibrary } from '../data/sampleTracks';

export interface PlaylistContextType {
  library: Folder[];
  expandedFolders: string[];
  toggleFolder: (folderId: string) => void;
  draggedItem: {
    id: string;
    type: 'folder' | 'track' | '';
    parentId: string;
  };
  setDraggedItem: (type: 'folder' | 'track' | '', id: string, parentId: string) => void;
  handleDrop: (targetFolderId: string) => void;
  createNewFolder: (parentFolderId: string, folderName: string) => void;
  renameFolder: (folderId: string, newName: string) => void;
  deleteFolder: (folderId: string) => void;
  selectTrack: (track: Track) => void;
  addTrack: (track: Track, folderId: string) => void;
  removeTrack: (trackId: string, folderId: string) => void;
  moveTrack: (trackId: string, sourceFolderId: string, targetFolderId: string) => void;
  addToFavorites: (trackId: string) => void;
  isTrackInFavorites: (trackId: string) => boolean;
  isScanning: boolean;
  scanForMusic: () => Promise<void>;
  setLibrary: (newLibrary: Folder[]) => void;
  importPlaylists: (playlists: Folder[]) => void;
  updateTrack: (trackId: string, updatedTrack: Partial<Track>) => void;
  findTrackById: (trackId: string) => Track | null;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export const usePlaylist = () => {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error('usePlaylist must be used within a PlaylistProvider');
  }
  return context;
};

const PlaylistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [library, setLibrary] = useState<Folder[]>(sampleLibrary);
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['device-root', 'Chill-lofi']);
  const [isScanning, setIsScanning] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [draggedItem, setDraggedItemState] = useState<{
    id: string;
    type: 'folder' | 'track' | '';
    parentId: string;
  }>({
    id: '',
    type: '',
    parentId: ''
  });

  // Load library from localStorage on mount
  useEffect(() => {
    const savedLibrary = localStorage.getItem('musicLibrary');
    if (savedLibrary) {
      try {
        const parsedLibrary = JSON.parse(savedLibrary);
        setLibrary(parsedLibrary);
      } catch (error) {
        console.error('Failed to parse saved library:', error);
      }
    }
    
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error('Failed to parse saved favorites:', error);
      }
    }
  }, []);

  // Save library to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('musicLibrary', JSON.stringify(library));
  }, [library]);
  
  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      if (prev.includes(folderId)) {
        return prev.filter(id => id !== folderId);
      } else {
        return [...prev, folderId];
      }
    });
  };

  const setDraggedItem = (type: 'folder' | 'track' | '', id: string, parentId: string) => {
    setDraggedItemState({ type, id, parentId });
  };

  // Helper function to find a folder by ID
  const findFolder = (folders: Folder[], id: string): Folder | null => {
    for (const folder of folders) {
      if (folder.id === id) {
        return folder;
      }
      
      const foundInSubfolders = findFolder(folder.folders, id);
      if (foundInSubfolders) {
        return foundInSubfolders;
      }
    }
    
    return null;
  };

  // Helper function to find a folder's parent
  const findFolderParent = (folders: Folder[], id: string, parent: Folder | null = null): Folder | null => {
    for (const folder of folders) {
      if (folder.id === id) {
        return parent;
      }
      
      const foundInSubfolders = findFolderParent(folder.folders, id, folder);
      if (foundInSubfolders) {
        return foundInSubfolders;
      }
    }
    
    return null;
  };

  // Helper function to find a track by ID
  const findTrack = (folders: Folder[], id: string): { track: Track, folder: Folder } | null => {
    for (const folder of folders) {
      const track = folder.tracks.find(t => t.id === id);
      if (track) {
        return { track, folder };
      }
      
      const foundInSubfolders = findTrack(folder.folders, id);
      if (foundInSubfolders) {
        return foundInSubfolders;
      }
    }
    
    return null;
  };

  // Find a track by ID and return it
  const findTrackById = (trackId: string): Track | null => {
    const result = findTrack(library, trackId);
    return result ? result.track : null;
  };

  // Handle dropping a dragged item into a target folder
  const handleDrop = (targetFolderId: string) => {
    if (!draggedItem.id || !draggedItem.type) return;
    
    // Don't do anything if dropping onto the same folder
    if (draggedItem.parentId === targetFolderId) return;
    
    const newLibrary = [...library];
    
    if (draggedItem.type === 'folder') {
      // Find the folder to move
      const folderToMove = findFolder(newLibrary, draggedItem.id);
      if (!folderToMove) return;
      
      // Find the parent folder to remove it from
      const sourceParent = findFolderParent(newLibrary, draggedItem.id);
      
      // Find the target folder to add it to
      const targetFolder = findFolder(newLibrary, targetFolderId);
      if (!targetFolder) return;
      
      // Remove the folder from its current parent
      if (sourceParent) {
        sourceParent.folders = sourceParent.folders.filter(f => f.id !== draggedItem.id);
      } else {
        // It's a top-level folder
        setLibrary(newLibrary.filter(f => f.id !== draggedItem.id));
      }
      
      // Update the folder's parent reference
      folderToMove.parent = targetFolder.id;
      
      // Add the folder to the target folder
      targetFolder.folders.push(folderToMove);
      
      setLibrary(newLibrary);
    } else if (draggedItem.type === 'track') {
      // Find the track to move
      const result = findTrack(newLibrary, draggedItem.id);
      if (!result) return;
      
      const { track, folder: sourceFolder } = result;
      
      // Find the target folder
      const targetFolder = findFolder(newLibrary, targetFolderId);
      if (!targetFolder) return;
      
      // Remove the track from its current folder
      sourceFolder.tracks = sourceFolder.tracks.filter(t => t.id !== draggedItem.id);
      
      // Add the track to the target folder
      targetFolder.tracks.push(track);
      
      setLibrary(newLibrary);
    }
    
    // Reset the dragged item
    setDraggedItem('', '', '');
  };

  // Create a new folder
  const createNewFolder = (parentFolderId: string, folderName: string) => {
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name: folderName,
      tracks: [],
      folders: [],
      parent: parentFolderId
    };
    
    const newLibrary = [...library];
    
    if (parentFolderId === 'root') {
      // Add as a top-level folder
      newLibrary.push(newFolder);
    } else {
      // Find the parent folder and add the new folder to it
      const parentFolder = findFolder(newLibrary, parentFolderId);
      if (parentFolder) {
        parentFolder.folders.push(newFolder);
      }
    }
    
    setLibrary(newLibrary);
  };

  // Rename a folder
  const renameFolder = (folderId: string, newName: string) => {
    const newLibrary = [...library];
    const folder = findFolder(newLibrary, folderId);
    
    if (folder) {
      folder.name = newName;
      setLibrary(newLibrary);
    }
  };

  // Delete a folder
  const deleteFolder = (folderId: string) => {
    const newLibrary = [...library];
    
    // Find the parent folder
    const parentFolder = findFolderParent(newLibrary, folderId);
    
    if (parentFolder) {
      // Remove the folder from its parent
      parentFolder.folders = parentFolder.folders.filter(f => f.id !== folderId);
      setLibrary(newLibrary);
    } else {
      // It's a top-level folder
      setLibrary(newLibrary.filter(f => f.id !== folderId));
    }
  };

  // Select a track (for playing)
  const selectTrack = (track: Track) => {
    // This function doesn't modify the library, but it's included in the context
    // for consistency. In a real app, you might want to update a "currentTrack" state.
    console.log('Selected track:', track.title);
  };

  // Add a track to a folder
  const addTrack = (track: Track, folderId: string) => {
    const newLibrary = [...library];
    const folder = findFolder(newLibrary, folderId);
    
    if (folder) {
      folder.tracks.push(track);
      setLibrary(newLibrary);
    }
  };

  // Remove a track from a folder
  const removeTrack = (trackId: string, folderId: string) => {
    const newLibrary = [...library];
    const folder = findFolder(newLibrary, folderId);
    
    if (folder) {
      folder.tracks = folder.tracks.filter(t => t.id !== trackId);
      setLibrary(newLibrary);
    }
  };

  // Move a track from one folder to another
  const moveTrack = (trackId: string, sourceFolderId: string, targetFolderId: string) => {
    const newLibrary = [...library];
    const sourceFolder = findFolder(newLibrary, sourceFolderId);
    const targetFolder = findFolder(newLibrary, targetFolderId);
    
    if (sourceFolder && targetFolder) {
      const track = sourceFolder.tracks.find(t => t.id === trackId);
      if (track) {
        sourceFolder.tracks = sourceFolder.tracks.filter(t => t.id !== trackId);
        targetFolder.tracks.push(track);
        setLibrary(newLibrary);
      }
    }
  };

  // Add a track to favorites
  const addToFavorites = (trackId: string) => {
    if (favorites.includes(trackId)) {
      setFavorites(favorites.filter(id => id !== trackId));
    } else {
      setFavorites([...favorites, trackId]);
    }
  };

  // Check if a track is in favorites
  const isTrackInFavorites = (trackId: string) => {
    return favorites.includes(trackId);
  };

  // Import playlists (new function)
  const importPlaylists = (playlists: Folder[]) => {
    setLibrary((currentLibrary) => {
      return [...currentLibrary, ...playlists];
    });
  };

  // Update a track's metadata
  const updateTrack = (trackId: string, updatedFields: Partial<Track>) => {
    const newLibrary = [...library];
    
    const updateTrackInFolders = (folders: Folder[]): boolean => {
      for (const folder of folders) {
        const trackIndex = folder.tracks.findIndex(t => t.id === trackId);
        
        if (trackIndex !== -1) {
          folder.tracks[trackIndex] = {
            ...folder.tracks[trackIndex],
            ...updatedFields
          };
          return true;
        }
        
        if (updateTrackInFolders(folder.folders)) {
          return true;
        }
      }
      
      return false;
    };
    
    if (updateTrackInFolders(newLibrary)) {
      setLibrary(newLibrary);
      return true;
    }
    
    return false;
  };

  // Scan for music files (enhanced implementation)
  const scanForMusic = async () => {
    setIsScanning(true);
    
    try {
      // In a real app, this would use the Electron API or Web File System API to scan the file system
      // For now, we'll just simulate a delay and add some mock tracks
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newLibrary = [...library];
      const deviceFolder = findFolder(newLibrary, 'device-root');
      
      if (deviceFolder) {
        // Add some mock scanned tracks
        const mockAudioFormats = ["mp3", "wav", "flac", "aac", "ogg"];
        const mockArtists = ["Unknown Artist", "Local Band", "Demo Artist", "Recorded Audio"];
        const mockAlbums = ["Unknown Album", "Local Recording", "Demo Album", "Voice Notes"];
        
        for (let i = 1; i <= 8; i++) {
          const format = mockAudioFormats[Math.floor(Math.random() * mockAudioFormats.length)];
          const artist = mockArtists[Math.floor(Math.random() * mockArtists.length)];
          const album = mockAlbums[Math.floor(Math.random() * mockAlbums.length)];
          const fileName = `Discovered Track ${Date.now()}-${i}`;
          const duration = `${Math.floor(Math.random() * 5) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
          
          const newTrack: Track = {
            id: `track-${Date.now()}-${i}`,
            title: fileName,
            artist: artist,
            album: album,
            cover: `https://source.unsplash.com/random/300x300?music&sig=${Date.now()}-${i}`,
            url: `/mock-path/music/${fileName}.${format}`,
            duration: duration
          };
          
          deviceFolder.tracks.push(newTrack);
        }
        
        setLibrary(newLibrary);
      }
    } catch (error) {
      console.error('Error scanning for music:', error);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <PlaylistContext.Provider value={{
      library,
      expandedFolders,
      toggleFolder,
      draggedItem,
      setDraggedItem,
      handleDrop,
      createNewFolder,
      renameFolder,
      deleteFolder,
      selectTrack,
      addTrack,
      removeTrack,
      moveTrack,
      addToFavorites,
      isTrackInFavorites,
      isScanning,
      scanForMusic,
      setLibrary,
      importPlaylists,
      updateTrack,
      findTrackById,
    }}>
      {children}
    </PlaylistContext.Provider>
  );
};

export { PlaylistProvider, PlaylistContext };
