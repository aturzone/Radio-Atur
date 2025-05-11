import React, { createContext, useContext, useState, useEffect } from 'react';
import { Folder, Track, musicLibrary } from '../data/sampleTracks';
import { toast } from 'sonner';
import * as fileSystem from '../utils/fileSystem';

interface PlaylistContextType {
  library: Folder[];
  expandedFolders: string[];
  currentTrackId: string | null;
  draggedItem: {
    type: 'track' | 'folder' | null;
    id: string | null;
    sourceFolderId: string | null;
  };
  isScanning: boolean;
  setLibrary: React.Dispatch<React.SetStateAction<Folder[]>>;
  toggleFolder: (folderId: string) => void;
  selectTrack: (track: Track) => void;
  scanForMusic: (customFiles?: File[]) => Promise<void>;
  createNewFolder: (parentFolderId: string, name: string) => void;
  deleteFolder: (folderId: string) => void;
  renameFolder: (folderId: string, newName: string) => void;
  setDraggedItem: (type: 'track' | 'folder' | null, id: string | null, sourceFolderId: string | null) => void;
  handleDrop: (targetFolderId: string) => void;
  addToFavorites: (track: Track) => void;
  isTrackInFavorites: (trackId: string) => boolean;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export const PlaylistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [library, setLibrary] = useState<Folder[]>(musicLibrary);
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['Chill-lofi']);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [draggedItem, setDraggedItemState] = useState<{
    type: 'track' | 'folder' | null;
    id: string | null;
    sourceFolderId: string | null;
  }>({
    type: null,
    id: null,
    sourceFolderId: null,
  });

  // Load library from localStorage on mount
  useEffect(() => {
    const savedLibrary = localStorage.getItem('musicLibrary');
    if (savedLibrary) {
      try {
        setLibrary(JSON.parse(savedLibrary));
      } catch (err) {
        console.error('Failed to parse saved library:', err);
      }
    } else {
      // If no saved library, ensure we have a Favorites folder
      ensureFavoritesFolder();
    }
  }, []);

  // Ensure radio folders are created
  useEffect(() => {
    ensureRadioFolders();
  }, []);

  // Save library to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('musicLibrary', JSON.stringify(library));
  }, [library]);

  // Make sure the Favorites folder exists
  const ensureFavoritesFolder = () => {
    const favoritesFolderId = 'favorites-folder';
    const hasFavoritesFolder = library.some(folder => folder.id === favoritesFolderId);

    if (!hasFavoritesFolder) {
      setLibrary(prev => [
        ...prev,
        {
          id: favoritesFolderId,
          name: "Favorites Playlist",
          tracks: [],
          folders: []
        }
      ]);
    }
  };

  // Make sure radio station folders exist
  const ensureRadioFolders = () => {
    // Import radio data asynchronously to avoid circular dependencies
    import('../data/sampleTracks').then(({ radioChannels }) => {
      const radioFolderId = 'radio-stations-folder';
      let hasRadioFolder = false;
      let radioFolder = null;

      // Check if radio stations folder already exists
      for (const folder of library) {
        if (folder.id === radioFolderId) {
          hasRadioFolder = true;
          radioFolder = folder;
          break;
        }
      }

      // If radio folder doesn't exist, create it
      if (!hasRadioFolder) {
        radioFolder = {
          id: radioFolderId,
          name: "Radio Stations",
          tracks: [],
          folders: []
        };

        setLibrary(prev => [...prev, radioFolder]);
      }

      // Create folders for each radio station if they don't exist
      const updatedLibrary = [...library];
      const radioFolderIndex = updatedLibrary.findIndex(f => f.id === radioFolderId);

      if (radioFolderIndex !== -1) {
        const stationFolders = radioChannels.map(channel => {
          // Check if this station folder already exists
          const existingFolder = updatedLibrary[radioFolderIndex].folders.find(
            f => f.name === channel.name
          );

          if (existingFolder) {
            return existingFolder;
          }

          // Create new folder for this station
          return {
            id: `radio-station-${channel.id}`,
            name: channel.name,
            description: channel.description,
            cover: channel.cover,
            tracks: [...channel.tracks],
            folders: [],
            parent: radioFolderId
          };
        });

        // Update the radio folder with all station folders
        updatedLibrary[radioFolderIndex] = {
          ...updatedLibrary[radioFolderIndex],
          folders: stationFolders
        };

        setLibrary(updatedLibrary);
      }
    });
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => 
      prev.includes(folderId)
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  const selectTrack = (track: Track) => {
    setCurrentTrackId(track.id);
  };

  // Add a track to favorites
  const addToFavorites = (track: Track) => {
    const favoritesFolderId = 'favorites-folder';
    
    // Make sure we have a favorites folder
    ensureFavoritesFolder();
    
    // Find the favorites folder
    const favoritesIndex = library.findIndex(folder => folder.id === favoritesFolderId);
    
    if (favoritesIndex === -1) {
      console.error("Favorites folder not found");
      return;
    }
    
    // Check if track is already in favorites
    const isAlreadyFavorite = library[favoritesIndex].tracks.some(t => t.id === track.id);
    
    if (isAlreadyFavorite) {
      // Remove from favorites
      const updatedLibrary = [...library];
      updatedLibrary[favoritesIndex] = {
        ...updatedLibrary[favoritesIndex],
        tracks: updatedLibrary[favoritesIndex].tracks.filter(t => t.id !== track.id)
      };
      
      setLibrary(updatedLibrary);
      toast.success(`Removed "${track.title}" from favorites`);
    } else {
      // Add to favorites
      const updatedLibrary = [...library];
      updatedLibrary[favoritesIndex] = {
        ...updatedLibrary[favoritesIndex],
        tracks: [...updatedLibrary[favoritesIndex].tracks, track]
      };
      
      setLibrary(updatedLibrary);
      toast.success(`Added "${track.title}" to favorites`);
    }
  };
  
  // Check if a track is in favorites
  const isTrackInFavorites = (trackId: string) => {
    const favoritesFolderId = 'favorites-folder';
    const favoritesFolder = library.find(folder => folder.id === favoritesFolderId);
    
    if (!favoritesFolder) return false;
    
    return favoritesFolder.tracks.some(track => track.id === trackId);
  };

  const scanForMusic = async (customFiles?: File[]) => {
    try {
      setIsScanning(true);
      
      // Use provided files or create file input for selecting files/folders
      let files: File[];
      
      if (customFiles && customFiles.length > 0) {
        files = customFiles;
      } else {
        // Create file input for selecting files/folders
        const input = document.createElement('input');
        input.type = 'file';
        input.webkitdirectory = true;
        input.multiple = true;
        
        // Handle file selection
        const filePromise = new Promise<File[]>((resolve) => {
          input.onchange = (event) => {
            const files = Array.from((event.target as HTMLInputElement).files || []);
            resolve(files);
          };
        });
        
        // Trigger file selection
        input.click();
        
        // Wait for user to select files
        files = await filePromise;
        
        if (files.length === 0) {
          toast.info("No files selected");
          setIsScanning(false);
          return;
        }
      }
      
      toast.info(`Processing ${files.length} files...`);
      
      // Create folder structure
      let deviceFolder = library.find(folder => folder.id === 'device-root');
      
      if (!deviceFolder) {
        deviceFolder = {
          id: 'device-root',
          name: 'Your Device',
          tracks: [],
          folders: []
        };
        
        setLibrary(prev => [...prev, deviceFolder!]);
        setExpandedFolders(prev => [...prev, 'device-root']);
      }
      
      // Process audio files and update folder
      const updatedFolder = await fileSystem.processAudioFiles(files, deviceFolder);
      
      // Update library with new device folder
      setLibrary(prev => {
        const index = prev.findIndex(folder => folder.id === 'device-root');
        if (index !== -1) {
          return [
            ...prev.slice(0, index),
            updatedFolder,
            ...prev.slice(index + 1)
          ];
        } else {
          return [...prev, updatedFolder];
        }
      });
      
      toast.success(`Added ${files.filter(f => f.type.startsWith('audio/')).length} audio files`);
    } catch (error) {
      console.error('Error scanning for music:', error);
      toast.error('Failed to scan for music');
    } finally {
      setIsScanning(false);
    }
  };

  const createNewFolder = (parentFolderId: string, name: string) => {
    if (!name.trim()) {
      toast.error('Folder name cannot be empty');
      return;
    }
    
    // Find the parent folder and add the new folder
    const updateFolderInLibrary = (folders: Folder[]): Folder[] => {
      return folders.map(folder => {
        if (folder.id === parentFolderId) {
          // Create new folder
          const newFolder: Folder = {
            id: crypto.randomUUID(),
            name: name.trim(),
            tracks: [],
            folders: [],
            parent: folder.id
          };
          
          // Add to parent
          return {
            ...folder,
            folders: [...folder.folders, newFolder]
          };
        }
        
        // Check subfolders
        return {
          ...folder,
          folders: updateFolderInLibrary(folder.folders)
        };
      });
    };
    
    setLibrary(updateFolderInLibrary);
    toast.success(`Created folder "${name}"`);
  };

  const deleteFolder = (folderId: string) => {
    // Recursive function to find and delete folder
    const updateFolderInLibrary = (folders: Folder[]): Folder[] => {
      // Check if folder is in this level
      const folderIndex = folders.findIndex(folder => folder.id === folderId);
      if (folderIndex !== -1) {
        return [
          ...folders.slice(0, folderIndex),
          ...folders.slice(folderIndex + 1)
        ];
      }
      
      // Check subfolders
      return folders.map(folder => ({
        ...folder,
        folders: updateFolderInLibrary(folder.folders)
      }));
    };
    
    setLibrary(updateFolderInLibrary);
    
    // Remove from expanded folders if present
    setExpandedFolders(prev => prev.filter(id => id !== folderId));
    
    toast.success('Folder deleted');
  };

  const renameFolder = (folderId: string, newName: string) => {
    if (!newName.trim()) {
      toast.error('Folder name cannot be empty');
      return;
    }
    
    // Find folder and rename it
    const updateFolderName = (folders: Folder[]): Folder[] => {
      return folders.map(folder => {
        if (folder.id === folderId) {
          return {
            ...folder,
            name: newName.trim()
          };
        }
        
        return {
          ...folder,
          folders: updateFolderName(folder.folders)
        };
      });
    };
    
    setLibrary(updateFolderName);
    toast.success(`Renamed folder to "${newName}"`);
  };

  const setDraggedItem = (
    type: 'track' | 'folder' | null, 
    id: string | null,
    sourceFolderId: string | null
  ) => {
    setDraggedItemState({ type, id, sourceFolderId });
  };

  const handleDrop = (targetFolderId: string) => {
    if (!draggedItem.id || !draggedItem.sourceFolderId || draggedItem.sourceFolderId === targetFolderId) {
      return;
    }
    
    // Prevent moving a folder into itself or its descendants
    if (draggedItem.type === 'folder') {
      const isTargetDescendant = (folderId: string, targetId: string): boolean => {
        if (folderId === targetId) return true;
        
        // Find the target folder
        const findFolder = (folders: Folder[]): Folder | undefined => {
          for (const folder of folders) {
            if (folder.id === targetId) return folder;
            
            const found = findFolder(folder.folders);
            if (found) return found;
          }
          return undefined;
        };
        
        const targetFolder = findFolder(library);
        
        if (!targetFolder) return false;
        
        // Check if target is a descendant of the folder being moved
        return isTargetDescendant(folderId, targetFolder.parent || '');
      };
      
      if (isTargetDescendant(draggedItem.id, targetFolderId)) {
        toast.error("Cannot move a folder into itself or its subfolders");
        setDraggedItemState({ type: null, id: null, sourceFolderId: null });
        return;
      }
    }
    
    // Handle the drop based on item type
    if (draggedItem.type === 'track') {
      // Move track
      const updateLibrary = (folders: Folder[]): Folder[] => {
        let trackToMove: Track | null = null;
        
        // Remove from source
        const removeFromSource = (folders: Folder[]): Folder[] => {
          return folders.map(folder => {
            if (folder.id === draggedItem.sourceFolderId) {
              const trackIndex = folder.tracks.findIndex(t => t.id === draggedItem.id);
              if (trackIndex !== -1) {
                trackToMove = folder.tracks[trackIndex];
                return {
                  ...folder,
                  tracks: [
                    ...folder.tracks.slice(0, trackIndex),
                    ...folder.tracks.slice(trackIndex + 1)
                  ]
                };
              }
            }
            
            return {
              ...folder,
              folders: removeFromSource(folder.folders)
            };
          });
        };
        
        // Add to target
        const addToTarget = (folders: Folder[]): Folder[] => {
          return folders.map(folder => {
            if (folder.id === targetFolderId && trackToMove) {
              return {
                ...folder,
                tracks: [...folder.tracks, trackToMove]
              };
            }
            
            return {
              ...folder,
              folders: addToTarget(folder.folders)
            };
          });
        };
        
        // Execute move
        const updatedAfterRemove = removeFromSource(folders);
        return trackToMove ? addToTarget(updatedAfterRemove) : updatedAfterRemove;
      };
      
      setLibrary(updateLibrary);
      toast.success('Track moved successfully');
    } else if (draggedItem.type === 'folder') {
      // Move folder
      const updateLibrary = (folders: Folder[]): Folder[] => {
        let folderToMove: Folder | null = null;
        
        // Remove from source
        const removeFromSource = (folders: Folder[]): Folder[] => {
          // Check if folder is in this level
          const folderIndex = folders.findIndex(folder => folder.id === draggedItem.id);
          if (folderIndex !== -1) {
            folderToMove = folders[folderIndex];
            return [
              ...folders.slice(0, folderIndex),
              ...folders.slice(folderIndex + 1)
            ];
          }
          
          // Check subfolders
          return folders.map(folder => ({
            ...folder,
            folders: removeFromSource(folder.folders)
          }));
        };
        
        // Add to target
        const addToTarget = (folders: Folder[]): Folder[] => {
          return folders.map(folder => {
            if (folder.id === targetFolderId && folderToMove) {
              const updatedFolderToMove = {
                ...folderToMove,
                parent: folder.id
              };
              
              return {
                ...folder,
                folders: [...folder.folders, updatedFolderToMove]
              };
            }
            
            return {
              ...folder,
              folders: addToTarget(folder.folders)
            };
          });
        };
        
        // Execute move
        const updatedAfterRemove = removeFromSource(folders);
        return folderToMove ? addToTarget(updatedAfterRemove) : updatedAfterRemove;
      };
      
      setLibrary(updateLibrary);
      toast.success('Folder moved successfully');
    }
    
    // Reset drag state
    setDraggedItemState({ type: null, id: null, sourceFolderId: null });
  };

  const value = {
    library,
    expandedFolders,
    currentTrackId,
    draggedItem,
    isScanning,
    setLibrary,
    toggleFolder,
    selectTrack,
    scanForMusic,
    createNewFolder,
    deleteFolder,
    renameFolder,
    setDraggedItem,
    handleDrop,
    addToFavorites,
    isTrackInFavorites
  };

  return (
    <PlaylistContext.Provider value={value}>
      {children}
    </PlaylistContext.Provider>
  );
};

export const usePlaylist = () => {
  const context = useContext(PlaylistContext);
  if (context === undefined) {
    throw new Error('usePlaylist must be used within a PlaylistProvider');
  }
  return context;
};
