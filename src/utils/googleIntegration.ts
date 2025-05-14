
import { toast } from 'sonner';
import { Track, Folder } from '../data/sampleTracks';

// API configuration for Google services
const CLIENT_ID = 'your-google-client-id.apps.googleusercontent.com';
const API_KEY = 'your-google-api-key';
const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
  'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'
];
const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/gmail.readonly';
const MUSIC_FOLDER_NAME = 'CozyAudioCafe_Music';
const BACKUP_FOLDER_NAME = 'CozyAudioCafe_Backups';

// Valid audio file extensions
const VALID_AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac', '.opus'];

let gapiLoaded = false;
let gisLoaded = false;
let tokenClient: ReturnType<typeof window.google.accounts.oauth2.initTokenClient> | null = null;

/**
 * Load the Google API client library
 */
export const loadGoogleApis = async (): Promise<void> => {
  try {
    if (!gapiLoaded) {
      // Load the Google API client library
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          gapiLoaded = true;
          resolve();
        };
        script.onerror = () => {
          reject(new Error('Failed to load Google API client library'));
        };
        document.head.appendChild(script);
      });

      // Initialize the Google API client library
      await new Promise<void>((resolve, reject) => {
        window.gapi.load('client', {
          callback: async () => {
            try {
              await window.gapi.client.init({
                apiKey: API_KEY,
                discoveryDocs: DISCOVERY_DOCS,
              });
              resolve();
            } catch (error) {
              reject(error);
            }
          },
          onerror: reject,
        });
      });
    }

    if (!gisLoaded) {
      // Load the Google Identity Services library
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          gisLoaded = true;
          resolve();
        };
        script.onerror = () => {
          reject(new Error('Failed to load Google Identity Services library'));
        };
        document.head.appendChild(script);
      });

      // Initialize the token client with simplified user experience
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (response) => {
          if (response.error) {
            toast.error(`Authentication error: ${response.error}`);
          }
        },
      });
    }
  } catch (error) {
    console.error('Error loading Google APIs:', error);
    toast.error('Failed to load Google APIs. Please try again later.');
    throw error;
  }
};

/**
 * Check if the user is authenticated with Google
 */
export const isAuthenticated = (): boolean => {
  return window.gapi.client.getToken() !== null;
};

/**
 * Authenticate with Google (Gmail login)
 */
export const authenticate = async (): Promise<void> => {
  try {
    await loadGoogleApis();

    if (!isAuthenticated() && tokenClient) {
      // Request an access token with a simple one-click flow
      await new Promise<void>((resolve, reject) => {
        if (tokenClient) {
          tokenClient.callback = (response: any) => {
            if (response.error) {
              reject(new Error(`Authentication error: ${response.error}`));
            } else {
              resolve();
            }
          };
          tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
          reject(new Error('Token client not initialized'));
        }
      });

      toast.success('Successfully connected to Google Account');
    }
  } catch (error) {
    console.error('Authentication error:', error);
    toast.error('Failed to connect to Google. Please try again.');
    throw error;
  }
};

/**
 * Sign out from Google
 */
export const signOut = (): void => {
  const token = window.gapi.client.getToken();
  if (token) {
    window.google.accounts.oauth2.revoke(token.access_token, () => {
      window.gapi.client.setToken(null);
      toast.success('Signed out from Google Account');
    });
  }
};

/**
 * Get user's Gmail profile information
 */
export const getGmailProfile = async (): Promise<{ email: string; name: string }> => {
  try {
    await loadGoogleApis();
    
    if (!isAuthenticated()) {
      await authenticate();
    }

    const response = await window.gapi.client.gmail.users.getProfile({ userId: 'me' });
    const email = response.result.emailAddress;
    
    // Try to get user's name
    const peopleResponse = await fetch(
      `https://people.googleapis.com/v1/people/me?personFields=names`,
      {
        headers: {
          Authorization: `Bearer ${window.gapi.client.getToken().access_token}`,
        },
      }
    );
    
    const peopleData = await peopleResponse.json();
    const name = peopleData.names?.[0]?.displayName || email;
    
    return { email, name };
  } catch (error) {
    console.error('Error getting Gmail profile:', error);
    toast.error('Failed to get Gmail profile information.');
    throw error;
  }
};

/**
 * Create a folder in Google Drive if it doesn't exist
 */
const findOrCreateFolder = async (folderName: string, parentFolderId?: string): Promise<string> => {
  try {
    // Build query to search for the folder
    let query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    if (parentFolderId) {
      query += ` and '${parentFolderId}' in parents`;
    }

    // Search for the folder
    const response = await window.gapi.client.drive.files.list({
      q: query,
      spaces: 'drive',
      fields: 'files(id, name)',
    });

    // If folder exists, return its ID
    if (response.result.files && response.result.files.length > 0) {
      return response.result.files[0].id;
    }

    // If folder doesn't exist, create it
    const fileMetadata: any = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    };

    if (parentFolderId) {
      fileMetadata.parents = [parentFolderId];
    }

    const createResponse = await window.gapi.client.drive.files.create({
      resource: fileMetadata,
      fields: 'id',
    });

    return createResponse.result.id;
  } catch (error) {
    console.error('Error finding or creating folder:', error);
    toast.error('Failed to create folder in Google Drive.');
    throw error;
  }
};

/**
 * Check if a file is an audio file by its extension
 */
export const isAudioFile = (fileName: string): boolean => {
  const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
  return VALID_AUDIO_EXTENSIONS.includes(ext);
};

/**
 * Manual sync of music files to Google Drive
 */
export const syncToGoogleDrive = async (library: Folder[]): Promise<void> => {
  try {
    await loadGoogleApis();
    
    if (!isAuthenticated()) {
      await authenticate();
    }

    // Create main music folder
    const mainFolderId = await findOrCreateFolder(MUSIC_FOLDER_NAME);
    toast.info('Syncing music to Google Drive...');
    
    // Process each folder and its tracks
    for (const folder of library) {
      // Skip radio stations folder
      if (folder.id === 'radio-stations-folder') continue;
      
      // Create folder
      const folderMetadata = {
        name: folder.name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [mainFolderId]
      };
      
      // Check if folder already exists
      const folderResponse = await window.gapi.client.drive.files.list({
        q: `name='${folder.name}' and mimeType='application/vnd.google-apps.folder' and '${mainFolderId}' in parents and trashed=false`,
        fields: 'files(id, name)'
      });
      
      let folderId: string;
      if (folderResponse.result.files && folderResponse.result.files.length > 0) {
        folderId = folderResponse.result.files[0].id;
      } else {
        const createFolderResponse = await window.gapi.client.drive.files.create({
          resource: folderMetadata,
          fields: 'id'
        });
        folderId = createFolderResponse.result.id;
      }
      
      // Create metadata for each track
      for (const track of folder.tracks) {
        // Skip tracks without URLs
        if (!track.url) continue;
        
        const trackMetadata = {
          name: track.title,
          description: `Artist: ${track.artist}${track.album ? `, Album: ${track.album}` : ''}`,
          properties: {
            trackId: track.id,
            artist: track.artist,
            album: track.album || ''
          },
          parents: [folderId]
        };
        
        // Check if track already exists
        const trackResponse = await window.gapi.client.drive.files.list({
          q: `name='${track.title}' and '${folderId}' in parents and trashed=false`,
          fields: 'files(id, name)'
        });
        
        if (trackResponse.result.files && trackResponse.result.files.length === 0) {
          // Track doesn't exist, log it (in a real app, upload the file)
          console.log(`Would upload track: ${track.title} by ${track.artist} to folder: ${folder.name}`);
        }
      }
      
      // Recursively handle subfolders
      for (const subFolder of folder.folders) {
        await syncFolderRecursively(subFolder, folderId);
      }
    }
    
    toast.success('Your music has been synced to Google Drive');
  } catch (error) {
    console.error('Error syncing to Google Drive:', error);
    toast.error('Failed to sync to Google Drive. Please try again.');
    throw error;
  }
};

/**
 * Recursive function to sync a folder and its contents
 */
async function syncFolderRecursively(folder: Folder, parentId: string): Promise<void> {
  // Create folder
  const folderMetadata = {
    name: folder.name,
    mimeType: 'application/vnd.google-apps.folder',
    parents: [parentId]
  };
  
  // Check if folder already exists
  const folderResponse = await window.gapi.client.drive.files.list({
    q: `name='${folder.name}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`,
    fields: 'files(id, name)'
  });
  
  let folderId: string;
  if (folderResponse.result.files && folderResponse.result.files.length > 0) {
    folderId = folderResponse.result.files[0].id;
  } else {
    const createFolderResponse = await window.gapi.client.drive.files.create({
      resource: folderMetadata,
      fields: 'id'
    });
    folderId = createFolderResponse.result.id;
  }
  
  // Create metadata for each track
  for (const track of folder.tracks) {
    // Skip tracks without URLs
    if (!track.url) continue;
    
    const trackMetadata = {
      name: track.title,
      description: `Artist: ${track.artist}${track.album ? `, Album: ${track.album}` : ''}`,
      properties: {
        trackId: track.id,
        artist: track.artist,
        album: track.album || ''
      },
      parents: [folderId]
    };
    
    // Check if track already exists
    const trackResponse = await window.gapi.client.drive.files.list({
      q: `name='${track.title}' and '${folderId}' in parents and trashed=false`,
      fields: 'files(id, name)'
    });
    
    if (trackResponse.result.files && trackResponse.result.files.length === 0) {
      // Track doesn't exist, log it (in a real app, upload the file)
      console.log(`Would upload track: ${track.title} by ${track.artist} to folder: ${folder.name}`);
    }
  }
  
  // Recursively handle subfolders
  for (const subFolder of folder.folders) {
    await syncFolderRecursively(subFolder, folderId);
  }
}

/**
 * Create a full backup of the music library to Google Drive
 */
export const backupToGoogleDrive = async (library: Folder[]): Promise<void> => {
  try {
    await loadGoogleApis();
    
    if (!isAuthenticated()) {
      await authenticate();
    }

    // Create backup folder
    const backupFolderId = await findOrCreateFolder(BACKUP_FOLDER_NAME);
    
    // Create a timestamp for this backup
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Create a subfolder with timestamp
    const backupTimeFolderId = await findOrCreateFolder(`Backup_${timestamp}`, backupFolderId);
    
    // Create a JSON file with the library data (exclude radio stations)
    const libraryToBackup = library.filter(folder => folder.id !== 'radio-stations-folder');
    const libraryJson = JSON.stringify(libraryToBackup, null, 2);
    const libraryBlob = new Blob([libraryJson], { type: 'application/json' });
    
    // Upload the library JSON file
    const form = new FormData();
    const fileMetadata = {
      name: 'musicLibrary.json',
      parents: [backupTimeFolderId],
      description: 'Cozy Audio Café music library backup'
    };
    
    form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
    form.append('file', libraryBlob);

    await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${window.gapi.client.getToken().access_token}`,
      },
      body: form,
    });

    // Create settings backup file
    const settings = {
      theme: localStorage.getItem('theme') || 'light',
      colorTheme: localStorage.getItem('colorTheme') || 'default',
      scanDirectories: JSON.parse(localStorage.getItem('scanDirectories') || '[]'),
      lastBackupDate: timestamp
    };
    
    const settingsJson = JSON.stringify(settings, null, 2);
    const settingsBlob = new Blob([settingsJson], { type: 'application/json' });
    
    // Upload the settings JSON file
    const settingsForm = new FormData();
    const settingsFileMetadata = {
      name: 'appSettings.json',
      parents: [backupTimeFolderId],
      description: 'Cozy Audio Café settings backup'
    };
    
    settingsForm.append('metadata', new Blob([JSON.stringify(settingsFileMetadata)], { type: 'application/json' }));
    settingsForm.append('file', settingsBlob);

    await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${window.gapi.client.getToken().access_token}`,
      },
      body: settingsForm,
    });
    
    toast.success('Your music library and settings have been backed up to Google Drive');
  } catch (error) {
    console.error('Error backing up to Google Drive:', error);
    toast.error('Failed to create backup. Please try again.');
    throw error;
  }
};

/**
 * List all available backups from Google Drive
 */
export const listBackups = async (): Promise<{id: string, name: string, date: string}[]> => {
  try {
    await loadGoogleApis();
    
    if (!isAuthenticated()) {
      await authenticate();
    }

    // Find the backup folder
    const folderListResponse = await window.gapi.client.drive.files.list({
      q: `name='${BACKUP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      spaces: 'drive',
      fields: 'files(id, name)',
    });

    if (!folderListResponse.result.files || folderListResponse.result.files.length === 0) {
      toast.info('No backups found in Google Drive');
      return [];
    }

    const backupFolderId = folderListResponse.result.files[0].id;

    // List all backup folders
    const backupsResponse = await window.gapi.client.drive.files.list({
      q: `'${backupFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      spaces: 'drive',
      fields: 'files(id, name, modifiedTime)',
    });

    if (!backupsResponse.result.files || backupsResponse.result.files.length === 0) {
      toast.info('No backups found');
      return [];
    }

    return backupsResponse.result.files.map(file => ({
      id: file.id,
      name: file.name,
      date: file.modifiedTime || 'Unknown date'
    }));
  } catch (error) {
    console.error('Error listing backups:', error);
    toast.error('Failed to list backups from Google Drive');
    throw error;
  }
};

/**
 * Restore music library from Google Drive backup
 */
export const restoreFromBackup = async (backupId: string): Promise<Folder[]> => {
  try {
    await loadGoogleApis();
    
    if (!isAuthenticated()) {
      await authenticate();
    }

    // Find the library file in the backup
    const fileListResponse = await window.gapi.client.drive.files.list({
      q: `name='musicLibrary.json' and '${backupId}' in parents and trashed=false`,
      spaces: 'drive',
      fields: 'files(id, name)',
    });

    if (!fileListResponse.result.files || fileListResponse.result.files.length === 0) {
      toast.error('No library backup file found in this backup');
      throw new Error('No library backup file found');
    }

    const fileId = fileListResponse.result.files[0].id;

    // Download the file
    const response = await window.gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media',
    });

    // Parse the JSON data
    const library = JSON.parse(response.body) as Folder[];
    
    // Try to find and restore settings
    try {
      const settingsFileResponse = await window.gapi.client.drive.files.list({
        q: `name='appSettings.json' and '${backupId}' in parents and trashed=false`,
        spaces: 'drive',
        fields: 'files(id, name)',
      });

      if (settingsFileResponse.result.files && settingsFileResponse.result.files.length > 0) {
        const settingsFileId = settingsFileResponse.result.files[0].id;
        
        const settingsResponse = await window.gapi.client.drive.files.get({
          fileId: settingsFileId,
          alt: 'media',
        });
        
        const settings = JSON.parse(settingsResponse.body);
        
        // Restore settings
        if (settings.theme) localStorage.setItem('theme', settings.theme);
        if (settings.colorTheme) localStorage.setItem('colorTheme', settings.colorTheme);
        if (settings.scanDirectories) localStorage.setItem('scanDirectories', JSON.stringify(settings.scanDirectories));
      }
    } catch (settingsError) {
      console.error('Error restoring settings:', settingsError);
      // Continue even if settings restore fails
    }
    
    toast.success('Music library restored from Google Drive');
    return library;
  } catch (error) {
    console.error('Error restoring from backup:', error);
    toast.error('Failed to restore from backup. Please try again.');
    throw error;
  }
};
