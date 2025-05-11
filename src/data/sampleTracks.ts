
export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: string;
  url: string;
  cover?: string;
}

export interface Folder {
  id: string;
  name: string;
  tracks: Track[];
  folders: Folder[];
  parent?: string;
}

// Sample music library structure
export const musicLibrary: Folder[] = [
  {
    id: "Artists",
    name: "Artists",
    tracks: [
    ],
    folders: [
      {
        id: "JVKE",
        name: "JVKE",
        parent: "Artists",
        tracks: [
        ],
        folders: []
      }
    ]
  },
  {
    id: "Chill-lofi",
    name: "Chill Lofi",
    tracks: [
      {
        id: "lofi-1",
        title: "Coffee Lofi",
        artist: "Unknown Artist",
        album: "Lofi Beats",
        duration: "3:00",
        url: "/music/Chill%20lofi/coffee-lofi-chill-lofi-music-332738.mp3",
        cover: "https://link-to-cover-image.jpg"
      },
      {
        id: "lofi-2",
        title: "Rainy Lofi",
        artist: "Unknown Artist",
        album: "Lofi Beats",
        duration: "3:30",
        url: "/music/Chill%20lofi/lofi-rain-lofi-music-332732.mp3",
        cover: "https://link-to-cover-image.jpg"
      },
      {
        id: "lofi-3",
        title: "Lofi Background Music",
        artist: "Unknown Artist",
        album: "Lofi Beats",
        duration: "3:40",
        url: "/music/Chill%20lofi/lofi-background-music-336230.mp3",
        cover: "https://link-to-cover-image.jpg"
      },
      {
        id: "lofi-4",
        title: "Quiet Night",
        artist: "Unknown Artist",
        album: "Lofi Beats",
        duration: "3:15",
        url: "/music/Chill%20lofi/quiet-night-lofi-332744.mp3",
        cover: "https://link-to-cover-image.jpg"
      },
      {
        id: "lofi-5",
        title: "Lofi Coffee",
        artist: "Unknown Artist",
        album: "Lofi Beats",
        duration: "3:10",
        url: "/music/Chill%20lofi/lofi-coffee-332824.mp3",
        cover: "https://link-to-cover-image.jpg"
      },
      {
        id: "lofi-6",
        title: "Rainy Lofi City",
        artist: "Unknown Artist",
        album: "Lofi Beats",
        duration: "3:30",
        url: "/music/Chill%20lofi/rainy-lofi-city-lofi-music-332746.mp3",
        cover: "https://link-to-cover-image.jpg"
      }
    ],
    folders: []
  }
];

// Helper function to find a track by ID in the library
export const findTrackById = (trackId: string): Track | null => {
  const searchInFolder = (folder: Folder): Track | null => {
    // Search in current folder tracks
    const track = folder.tracks.find(track => track.id === trackId);
    if (track) return track;
    
    // Search in subfolders
    for (const subfolder of folder.folders) {
      const found = searchInFolder(subfolder);
      if (found) return found;
    }
    
    return null;
  };
  
  // Search all root folders
  for (const folder of musicLibrary) {
    const found = searchInFolder(folder);
    if (found) return found;
  }
  
  return null;
};

// Get folder path for a given folder ID
export const getFolderPath = (folderId: string): string[] => {
  const path: string[] = [];
  
  const findPath = (folders: Folder[], targetId: string, currentPath: string[]): boolean => {
    for (const folder of folders) {
      const newPath = [...currentPath, folder.name];
      
      if (folder.id === targetId) {
        path.push(...newPath);
        return true;
      }
      
      if (folder.folders.length > 0 && findPath(folder.folders, targetId, newPath)) {
        return true;
      }
    }
    
    return false;
  };
  
  findPath(musicLibrary, folderId, []);
  return path;
};
