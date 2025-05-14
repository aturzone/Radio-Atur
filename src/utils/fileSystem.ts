
import { Track, Folder } from '../data/sampleTracks';
import { v4 as uuidv4 } from 'uuid';

// Check if File System Access API is available
export const fileSystemAvailable = (): boolean => {
  return 'showDirectoryPicker' in window && 'showOpenFilePicker' in window;
};

// Parse file metadata from File objects
export const parseAudioFile = (file: File): Promise<Partial<Track>> => {
  return new Promise((resolve) => {
    // Create a temporary URL for this file
    const objectUrl = URL.createObjectURL(file);
    
    // Extract basic info from file name
    const fileNameParts = file.name.split('.');
    fileNameParts.pop(); // Remove extension
    const fileName = fileNameParts.join('.');
    
    // Try to parse artist - title format
    let artist = 'Unknown Artist';
    let title = fileName;
    
    if (fileName.includes(' - ')) {
      const parts = fileName.split(' - ');
      artist = parts[0];
      title = parts.slice(1).join(' - ');
    }
    
    // Create track object
    const track: Partial<Track> = {
      id: uuidv4(),
      title: title,
      artist: artist,
      duration: '--:--', // Will be populated when loaded
      url: objectUrl,
    };
    
    // Try to get duration
    const audio = new Audio();
    audio.src = objectUrl;
    
    const handleMetadata = () => {
      const minutes = Math.floor(audio.duration / 60);
      const seconds = Math.floor(audio.duration % 60);
      track.duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      // Clean up
      audio.removeEventListener('loadedmetadata', handleMetadata);
      resolve(track);
    };
    
    // Handle if metadata can't be loaded
    const handleError = () => {
      audio.removeEventListener('error', handleError);
      resolve(track);
    };
    
    audio.addEventListener('loadedmetadata', handleMetadata);
    audio.addEventListener('error', handleError);
  });
};

// Create folder structure from File objects
export const createFoldersFromFiles = (files: File[]): Folder => {
  // Create a root folder
  const rootFolder: Folder = {
    id: 'device-root',
    name: 'Your Device',
    tracks: [],
    folders: [],
  };
  
  // Map to keep track of created folders
  const folderMap = new Map<string, Folder>();
  folderMap.set('', rootFolder);
  
  // Process each file
  files.forEach(file => {
    // Get the path from the webkitRelativePath property if available
    const path = file.webkitRelativePath || '';
    const pathParts = path.split('/').filter(part => part !== '');
    
    // If there are no path parts, the file is in the root directory
    if (pathParts.length === 0 || (pathParts.length === 1 && pathParts[0] === file.name)) {
      // We'll process these files later
      return;
    }
    
    // Create folders for each part of the path
    let currentPath = '';
    let parentFolder = rootFolder;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      const folderName = pathParts[i];
      const newPath = currentPath ? `${currentPath}/${folderName}` : folderName;
      
      // Check if we've already created this folder
      if (!folderMap.has(newPath)) {
        const newFolder: Folder = {
          id: uuidv4(),
          name: folderName,
          tracks: [],
          folders: [],
          parent: parentFolder.id,
        };
        
        parentFolder.folders.push(newFolder);
        folderMap.set(newPath, newFolder);
      }
      
      parentFolder = folderMap.get(newPath)!;
      currentPath = newPath;
    }
  });
  
  return rootFolder;
};

// Process audio files and add them to the appropriate folders
export const processAudioFiles = async (
  files: File[], 
  rootFolder: Folder
): Promise<Folder> => {
  // Map to keep track of created folders
  const folderMap = new Map<string, Folder>();
  folderMap.set('', rootFolder);
  
  // Build folder structure
  for (const folder of getAllFolders(rootFolder)) {
    folderMap.set(folder.name, folder);
  }
  
  // Process each file
  for (const file of files) {
    // Skip non-audio files
    if (!file.type.startsWith('audio/')) continue;
    
    // Get the path from the webkitRelativePath property if available
    const path = file.webkitRelativePath || '';
    const pathParts = path.split('/').filter(part => part !== '');
    
    // Parse the audio metadata
    const track = await parseAudioFile(file);
    
    // If there are no path parts, the file is in the root directory
    if (pathParts.length === 0 || (pathParts.length === 1 && pathParts[0] === file.name)) {
      rootFolder.tracks.push(track as Track);
      continue;
    }
    
    // Find the folder for this file
    const folderPath = pathParts.slice(0, -1).join('/');
    let targetFolder = rootFolder;
    
    if (folderPath) {
      const folders = getAllFolders(rootFolder);
      const matchingFolder = folders.find(f => {
        const folderPathParts = getFolderPath(f.id, rootFolder).join('/');
        return folderPathParts.includes(folderPath);
      });
      
      if (matchingFolder) {
        targetFolder = matchingFolder;
      }
    }
    
    // Add the track to the folder
    targetFolder.tracks.push(track as Track);
  }
  
  return rootFolder;
};

// Get all folders in a folder structure (flattened)
export const getAllFolders = (rootFolder: Folder): Folder[] => {
  const folders: Folder[] = [rootFolder];
  
  const addFolders = (folder: Folder) => {
    folder.folders.forEach(subFolder => {
      folders.push(subFolder);
      addFolders(subFolder);
    });
  };
  
  addFolders(rootFolder);
  return folders;
};

// Get the path to a folder
export const getFolderPath = (folderId: string, rootFolder: Folder): string[] => {
  const path: string[] = [];
  
  const findPath = (folder: Folder, targetId: string): boolean => {
    if (folder.id === targetId) {
      path.push(folder.name);
      return true;
    }
    
    for (const subFolder of folder.folders) {
      if (findPath(subFolder, targetId)) {
        path.unshift(folder.name);
        return true;
      }
    }
    
    return false;
  };
  
  findPath(rootFolder, folderId);
  return path;
};

// Move a track between folders
export const moveTrack = (
  trackId: string, 
  sourceFolderId: string, 
  targetFolderId: string, 
  rootFolder: Folder
): Folder => {
  let trackToMove: Track | null = null;
  let updatedRoot = { ...rootFolder };
  
  // Find the source folder and remove the track
  const removeTrack = (folder: Folder, folderId: string, trackId: string): [Folder, Track | null] => {
    if (folder.id === folderId) {
      const trackIndex = folder.tracks.findIndex(t => t.id === trackId);
      if (trackIndex !== -1) {
        const track = folder.tracks[trackIndex];
        return [
          {
            ...folder,
            tracks: [...folder.tracks.slice(0, trackIndex), ...folder.tracks.slice(trackIndex + 1)]
          },
          track
        ];
      }
      return [folder, null];
    }
    
    const updatedFolders: Folder[] = [];
    let track: Track | null = null;
    
    for (const subFolder of folder.folders) {
      const [updatedFolder, foundTrack] = removeTrack(subFolder, folderId, trackId);
      updatedFolders.push(updatedFolder);
      if (foundTrack) track = foundTrack;
    }
    
    return [
      {
        ...folder,
        folders: updatedFolders
      },
      track
    ];
  };
  
  // Add the track to the target folder
  const addTrack = (folder: Folder, folderId: string, track: Track): Folder => {
    if (folder.id === folderId) {
      return {
        ...folder,
        tracks: [...folder.tracks, track]
      };
    }
    
    return {
      ...folder,
      folders: folder.folders.map(subFolder => addTrack(subFolder, folderId, track))
    };
  };
  
  // Remove the track from the source folder
  [updatedRoot, trackToMove] = removeTrack(updatedRoot, sourceFolderId, trackId);
  
  // Add the track to the target folder if it was found
  if (trackToMove) {
    updatedRoot = addTrack(updatedRoot, targetFolderId, trackToMove);
  }
  
  return updatedRoot;
};

// Move a folder between folders
export const moveFolder = (
  folderId: string, 
  targetFolderId: string, 
  rootFolder: Folder
): Folder => {
  let folderToMove: Folder | null = null;
  let updatedRoot = { ...rootFolder };
  
  // Find the folder and remove it from its current location
  const removeFolder = (folder: Folder, folderId: string): [Folder, Folder | null] => {
    const folderIndex = folder.folders.findIndex(f => f.id === folderId);
    
    if (folderIndex !== -1) {
      const folderToRemove = folder.folders[folderIndex];
      return [
        {
          ...folder,
          folders: [...folder.folders.slice(0, folderIndex), ...folder.folders.slice(folderIndex + 1)]
        },
        folderToRemove
      ];
    }
    
    const updatedFolders: Folder[] = [];
    let removedFolder: Folder | null = null;
    
    for (const subFolder of folder.folders) {
      const [updatedFolder, foundFolder] = removeFolder(subFolder, folderId);
      updatedFolders.push(updatedFolder);
      if (foundFolder) removedFolder = foundFolder;
    }
    
    return [
      {
        ...folder,
        folders: updatedFolders
      },
      removedFolder
    ];
  };
  
  // Add the folder to the target folder
  const addFolder = (folder: Folder, folderId: string, folderToAdd: Folder): Folder => {
    if (folder.id === folderId) {
      // Update parent reference
      const updatedFolderToAdd = {
        ...folderToAdd,
        parent: folder.id
      };
      
      return {
        ...folder,
        folders: [...folder.folders, updatedFolderToAdd]
      };
    }
    
    return {
      ...folder,
      folders: folder.folders.map(subFolder => addFolder(subFolder, folderId, folderToAdd))
    };
  };
  
  // Remove the folder from its current location
  [updatedRoot, folderToMove] = removeFolder(updatedRoot, folderId);
  
  // Add the folder to the target folder if it was found
  if (folderToMove) {
    updatedRoot = addFolder(updatedRoot, targetFolderId, folderToMove);
  }
  
  return updatedRoot;
};

// Create a new folder
export const createFolder = (
  parentFolderId: string, 
  folderName: string, 
  rootFolder: Folder
): Folder => {
  const newFolder: Folder = {
    id: uuidv4(),
    name: folderName,
    tracks: [],
    folders: [],
    parent: parentFolderId
  };
  
  // Add the new folder to the parent folder
  const addNewFolder = (folder: Folder, parentId: string, newFolder: Folder): Folder => {
    if (folder.id === parentId) {
      return {
        ...folder,
        folders: [...folder.folders, newFolder]
      };
    }
    
    return {
      ...folder,
      folders: folder.folders.map(subFolder => addNewFolder(subFolder, parentId, newFolder))
    };
  };
  
  return addNewFolder(rootFolder, parentFolderId, newFolder);
};

// Delete a folder
export const deleteFolder = (folderId: string, rootFolder: Folder): Folder => {
  // Find and remove the folder
  const removeFolder = (folder: Folder, targetId: string): Folder => {
    // Check if any direct children match the target ID
    const folderIndex = folder.folders.findIndex(f => f.id === targetId);
    
    if (folderIndex !== -1) {
      return {
        ...folder,
        folders: [...folder.folders.slice(0, folderIndex), ...folder.folders.slice(folderIndex + 1)]
      };
    }
    
    // Recursively check subfolders
    return {
      ...folder,
      folders: folder.folders.map(subFolder => removeFolder(subFolder, targetId))
    };
  };
  
  return removeFolder(rootFolder, folderId);
};

// Rename a folder
export const renameFolder = (
  folderId: string, 
  newName: string, 
  rootFolder: Folder
): Folder => {
  // Find and rename the folder
  const updateFolder = (folder: Folder, targetId: string, newName: string): Folder => {
    if (folder.id === targetId) {
      return {
        ...folder,
        name: newName
      };
    }
    
    return {
      ...folder,
      folders: folder.folders.map(subFolder => updateFolder(subFolder, targetId, newName))
    };
  };
  
  return updateFolder(rootFolder, folderId, newName);
};
