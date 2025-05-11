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

export interface RadioChannel {
  id: string;
  name: string;
  description: string;
  cover: string;
  tracks: Track[];
}

// Sample radio channels
export const radioChannels: RadioChannel[] = [
  {
    id: "lofi-beats",
    name: "Lofi Beats",
    description: "Chill beats to relax and study to",
    cover: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=500",
    tracks: [
      {
        id: "lofi-1",
        title: "Coffee Lofi",
        artist: "Lofi Artist",
        album: "Lofi Beats",
        duration: "3:00",
        url: "/music/Chill%20lofi/coffee-lofi-chill-lofi-music-332738.mp3",
        cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400"
      },
      {
        id: "lofi-2",
        title: "Rainy Lofi",
        artist: "Lofi Artist",
        album: "Lofi Beats",
        duration: "3:30",
        url: "/music/Chill%20lofi/lofi-rain-lofi-music-332732.mp3",
        cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400"
      },
      {
        id: "lofi-3",
        title: "Lofi Background Music",
        artist: "Lofi Artist",
        album: "Lofi Beats",
        duration: "3:40",
        url: "/music/Chill%20lofi/lofi-background-music-336230.mp3",
        cover: "https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?w=400"
      }
    ]
  },
  {
    id: "jazz-cafe",
    name: "Jazz Café",
    description: "Smooth jazz for your coffee break",
    cover: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=500",
    tracks: [
      {
        id: "lofi-4",
        title: "Quiet Night",
        artist: "Jazz Artist",
        album: "Jazz Café",
        duration: "3:15",
        url: "/music/Chill%20lofi/quiet-night-lofi-332744.mp3",
        cover: "https://images.unsplash.com/photo-1551081831-3352a0b9d511?w=400"
      },
      {
        id: "lofi-5",
        title: "Lofi Coffee",
        artist: "Jazz Artist",
        album: "Jazz Café",
        duration: "3:10",
        url: "/music/Chill%20lofi/lofi-coffee-332824.mp3",
        cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400"
      }
    ]
  },
  {
    id: "ambient",
    name: "Ambient Sounds",
    description: "Atmospheric and calming ambient music",
    cover: "https://images.unsplash.com/photo-1499415479124-43c32433a620?w=500",
    tracks: [
      {
        id: "lofi-6",
        title: "Rainy Lofi City",
        artist: "Ambient Artist",
        album: "Ambient Sounds",
        duration: "3:30",
        url: "/music/Chill%20lofi/rainy-lofi-city-lofi-music-332746.mp3",
        cover: "https://images.unsplash.com/photo-1582730147924-d92f4da00252?w=400"
      }
    ]
  },
  {
    id: "focus",
    name: "Deep Focus",
    description: "Music to help you concentrate",
    cover: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500",
    tracks: [
      {
        id: "lofi-1",
        title: "Coffee Lofi",
        artist: "Focus Artist",
        album: "Deep Focus",
        duration: "3:00",
        url: "/music/Chill%20lofi/coffee-lofi-chill-lofi-music-332738.mp3",
        cover: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400"
      },
      {
        id: "lofi-3",
        title: "Lofi Background Music",
        artist: "Focus Artist",
        album: "Deep Focus",
        duration: "3:40",
        url: "/music/Chill%20lofi/lofi-background-music-336230.mp3",
        cover: "https://images.unsplash.com/photo-1558021211-6d1403321394?w=400"
      }
    ]
  },
  {
    id: "sleep",
    name: "Sleep Sounds",
    description: "Relaxing sounds to help you sleep",
    cover: "https://images.unsplash.com/photo-1471560090527-d1af5e4e6eb6?w=500",
    tracks: [
      {
        id: "lofi-2",
        title: "Rainy Lofi",
        artist: "Sleep Artist",
        album: "Sleep Sounds",
        duration: "3:30",
        url: "/music/Chill%20lofi/lofi-rain-lofi-music-332732.mp3",
        cover: "https://images.unsplash.com/photo-1455642305367-68834a9c8827?w=400"
      },
      {
        id: "lofi-4",
        title: "Quiet Night",
        artist: "Sleep Artist",
        album: "Sleep Sounds",
        duration: "3:15",
        url: "/music/Chill%20lofi/quiet-night-lofi-332744.mp3",
        cover: "https://images.unsplash.com/photo-1468657988500-aca2be09f4c6?w=400"
      }
    ]
  }
];

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

// Shuffle an array using Fisher-Yates algorithm
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
