import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePlaylist } from '../contexts/PlaylistContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Folder, Track } from '@/data/sampleTracks';
import SongOptionsMenu from '../components/SongOptionsMenu';
import GoogleDriveMusicSync from '../components/GoogleDriveMusicSync';
import {
  Music,
  Upload,
  Search,
  FolderOpen,
  FileMusic,
  ArrowLeft,
  RefreshCw,
  Settings,
  Import,
  ExternalLink
} from 'lucide-react';

interface EditTrackFormProps {
  track: Track;
  onSave: (updatedTrack: Track) => void;
  onCancel: () => void;
}

const EditTrackForm: React.FC<EditTrackFormProps> = ({ track, onSave, onCancel }) => {
  const [title, setTitle] = useState(track.title);
  const [artist, setArtist] = useState(track.artist);
  const [album, setAlbum] = useState(track.album || '');
  const [coverUrl, setCoverUrl] = useState(track.cover || '');
  const [isUploading, setIsUploading] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedTrack: Track = {
      ...track,
      title,
      artist,
      album: album || undefined,
      cover: coverUrl || undefined
    };
    onSave(updatedTrack);
  };
  
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // In a real app, we would upload this to a server or save it locally
    // For now, we'll just create an object URL
    setIsUploading(true);
    
    setTimeout(() => {
      const objectUrl = URL.createObjectURL(file);
      setCoverUrl(objectUrl);
      setIsUploading(false);
    }, 1000);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-[1fr,2fr] gap-4">
        <div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Cover Art</label>
            <div className="rounded-md overflow-hidden">
              <AspectRatio ratio={1/1} className="bg-muted">
                {coverUrl ? (
                  <img 
                    src={coverUrl} 
                    alt={title} 
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-muted">
                    <Music className="h-10 w-10 text-muted-foreground opacity-50" />
                  </div>
                )}
              </AspectRatio>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Change Cover</label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="text-sm"
              disabled={isUploading}
            />
            {isUploading && (
              <p className="text-xs text-muted-foreground mt-1">Uploading...</p>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Song title"
            />
          </div>
          
          <div>
            <label htmlFor="artist" className="block text-sm font-medium mb-1">Artist</label>
            <Input
              id="artist"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Artist name"
            />
          </div>
          
          <div>
            <label htmlFor="album" className="block text-sm font-medium mb-1">Album</label>
            <Input
              id="album"
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
              placeholder="Album name (optional)"
            />
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Duration: {track.duration}</p>
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </DialogFooter>
    </form>
  );
};

const MusicLibrary = () => {
  const { 
    library, 
    scanForMusic, 
    isScanning,
    setLibrary
  } = usePlaylist();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [importPath, setImportPath] = useState('/music');
  const [exportPath, setExportPath] = useState('/exports');
  
  // Get all tracks from the library
  const getAllTracks = (): Track[] => {
    const tracks: Track[] = [];
    
    const extractTracks = (folders: Folder[]) => {
      folders.forEach(folder => {
        tracks.push(...folder.tracks);
        extractTracks(folder.folders);
      });
    };
    
    extractTracks(library);
    return tracks;
  };
  
  const allTracks = getAllTracks();
  
  // Filter tracks based on search query
  const filteredTracks = searchQuery 
    ? allTracks.filter(track => 
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (track.album && track.album.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : allTracks;
  
  const handleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // In a real app, we would process these files and add them to the library
    // For now, let's just show a toast message
    toast.success(`${files.length} file(s) uploaded successfully`);
    
    // Mock adding the files to the library
    const fileArray = Array.from(files);
    const newTracks: Track[] = fileArray.map((file, index) => ({
      id: `uploaded-${Date.now()}-${index}`,
      title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
      artist: "Unknown Artist",
      album: "Uploaded",
      duration: "0:00", // In a real app, we would get the duration
      url: URL.createObjectURL(file),
      cover: undefined
    }));
    
    // Add the tracks to the device-root folder
    const newLibrary = [...library];
    const deviceFolder = newLibrary.find(folder => folder.id === 'device-root');
    
    if (deviceFolder) {
      deviceFolder.tracks.push(...newTracks);
      setLibrary(newLibrary);
    }
  };
  
  const handleEditTrack = (track: Track) => {
    setEditingTrack(track);
  };
  
  const handleSaveTrack = (updatedTrack: Track) => {
    // Find the track in the library and update it
    const newLibrary = [...library];
    
    const updateTrackInFolder = (folders: Folder[]): boolean => {
      for (const folder of folders) {
        const trackIndex = folder.tracks.findIndex(t => t.id === updatedTrack.id);
        
        if (trackIndex !== -1) {
          folder.tracks[trackIndex] = updatedTrack;
          return true;
        }
        
        if (updateTrackInFolder(folder.folders)) {
          return true;
        }
      }
      
      return false;
    };
    
    if (updateTrackInFolder(newLibrary)) {
      setLibrary(newLibrary);
      toast.success("Track updated successfully");
    }
    
    setEditingTrack(null);
  };
  
  const handleImport = () => {
    // In a real app, this would trigger a file system dialog
    // For now, let's just show a toast message
    toast.success(`Import from ${importPath} completed`);
    setImportDialogOpen(false);
  };
  
  const handleExport = () => {
    // In a real app, this would trigger a file system dialog
    // For now, let's just show a toast message
    toast.success(`Export to ${exportPath} completed`);
    setExportDialogOpen(false);
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 bg-card shadow-sm flex items-center">
        <Link to="/" className="mr-4">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to home</span>
          </Button>
        </Link>
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Music className="h-5 w-5" /> Music Library
        </h1>
      </header>
      
      <div className="flex-1 p-4 overflow-hidden flex flex-col">
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, artist or album..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button onClick={() => scanForMusic()} disabled={isScanning}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isScanning ? "animate-spin" : ""}`} />
            {isScanning ? "Scanning..." : "Scan Device"}
          </Button>
          
          <Button variant="outline" onClick={() => document.getElementById("upload-music")?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Music
            <input
              id="upload-music"
              type="file"
              multiple
              accept="audio/*"
              className="hidden"
              onChange={handleFilesUpload}
            />
          </Button>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setImportDialogOpen(true)}>
              <Import className="h-4 w-4" />
              <span className="sr-only">Import</span>
            </Button>
            <Button variant="outline" size="icon" onClick={() => setExportDialogOpen(true)}>
              <ExternalLink className="h-4 w-4" />
              <span className="sr-only">Export</span>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <Link to="/settings">
                <Settings className="h-4 w-4" />
                <span className="sr-only">Settings</span>
              </Link>
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all-music" className="flex-1 overflow-hidden">
          <TabsList>
            <TabsTrigger value="all-music">All Music</TabsTrigger>
            <TabsTrigger value="playlists">Playlists</TabsTrigger>
            <TabsTrigger value="google-drive">Google Drive</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all-music" className="flex-1 overflow-hidden">
            <div className="bg-card rounded-md p-2">
              {filteredTracks.length > 0 ? (
                <ScrollArea className="h-[calc(100vh-220px)]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-2">
                    {filteredTracks.map((track) => (
                      <Card key={track.id} className="overflow-hidden">
                        <CardHeader className="p-0">
                          <AspectRatio ratio={1/1}>
                            {track.cover ? (
                              <img 
                                src={track.cover} 
                                alt={track.title} 
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full bg-muted">
                                <FileMusic className="h-12 w-12 text-muted-foreground opacity-50" />
                              </div>
                            )}
                          </AspectRatio>
                        </CardHeader>
                        <CardContent className="p-4">
                          <CardTitle className="text-base truncate">
                            {track.title}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground truncate">
                            {track.artist}
                          </p>
                          {track.album && (
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {track.album}
                            </p>
                          )}
                        </CardContent>
                        <CardFooter className="p-3 pt-0 justify-between">
                          <span className="text-xs text-muted-foreground">
                            {track.duration}
                          </span>
                          <div onClick={(e) => e.stopPropagation()}>
                            <SongOptionsMenu 
                              track={track} 
                              onEdit={() => handleEditTrack(track)}
                            />
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <FileMusic className="h-16 w-16 text-muted-foreground opacity-30 mb-4" />
                  {searchQuery ? (
                    <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
                  ) : (
                    <>
                      <p className="text-muted-foreground">Your music library is empty</p>
                      <Button 
                        variant="outline" 
                        className="mt-4" 
                        onClick={() => document.getElementById("upload-music")?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Music
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="playlists" className="overflow-hidden">
            <div className="bg-card rounded-md p-4 h-full">
              <ScrollArea className="h-[calc(100vh-220px)]">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                  {library
                    .filter(folder => folder.id !== 'device-root' && folder.id !== 'Artists')
                    .map((folder) => (
                      <Card key={folder.id}>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <FolderOpen className="h-5 w-5" />
                            {folder.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            {folder.tracks.length} tracks
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/?folder=${folder.id}`}>
                              Open Playlist
                            </Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
          
          <TabsContent value="google-drive" className="overflow-hidden">
            <div className="bg-card rounded-md p-4 h-full">
              <GoogleDriveMusicSync />
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Edit Track Dialog */}
      <Dialog open={editingTrack !== null} onOpenChange={(open) => !open && setEditingTrack(null)}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Edit Track</DialogTitle>
          </DialogHeader>
          {editingTrack && (
            <EditTrackForm 
              track={editingTrack} 
              onSave={handleSaveTrack}
              onCancel={() => setEditingTrack(null)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Music</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Import Directory</label>
              <div className="flex gap-2">
                <Input 
                  value={importPath} 
                  onChange={(e) => setImportPath(e.target.value)}
                  placeholder="/path/to/music"
                />
                <Button variant="outline" size="icon">
                  <FolderOpen className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Library</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Export Directory</label>
              <div className="flex gap-2">
                <Input 
                  value={exportPath} 
                  onChange={(e) => setExportPath(e.target.value)}
                  placeholder="/path/to/export"
                />
                <Button variant="outline" size="icon">
                  <FolderOpen className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport}>Export</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MusicLibrary;
