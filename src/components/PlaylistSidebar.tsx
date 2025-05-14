
import React, { useState } from 'react';
import { usePlaylist } from '../contexts/PlaylistContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import PlaylistFolder from './PlaylistFolder';
import { Track } from '../data/sampleTracks';
import { PlusCircle, ListMusic, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import ScrollableMenu from './ScrollableMenu';

interface PlaylistSidebarProps {
  onTrackSelect: (track: Track) => void;
  currentTrackId: string | null;
  className?: string;
}

const PlaylistSidebar: React.FC<PlaylistSidebarProps> = ({
  onTrackSelect,
  currentTrackId,
  className
}) => {
  const { library, createNewFolder } = usePlaylist();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createNewFolder('device-root', newFolderName);
      setNewFolderName('');
      setIsNewFolderDialogOpen(false);
      toast.success(`Created new playlist: ${newFolderName}`);
    }
  };

  return (
    <div
      className={cn(
        "relative transition-all duration-300 flex flex-col border-r border-border",
        isCollapsed ? "w-12" : "w-72 md:w-80",
        className
      )}
    >
      {/* Collapse toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-3 z-10 h-6 w-6 rounded-full border shadow-sm bg-background"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
        <span className="sr-only">
          {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        </span>
      </Button>

      {/* Sidebar header */}
      <div className={cn(
        "p-4 flex items-center justify-between",
        isCollapsed && "justify-center"
      )}>
        {!isCollapsed && (
          <h2 className="text-lg font-semibold flex items-center">
            <ListMusic className="h-5 w-5 mr-2" />
            Playlists
          </h2>
        )}
        <Button
          variant="ghost"
          size={isCollapsed ? "icon" : "sm"}
          onClick={() => setIsNewFolderDialogOpen(true)}
          className={isCollapsed ? "w-8 h-8 p-0" : ""}
          title="Create new playlist"
        >
          {isCollapsed ? (
            <PlusCircle className="h-5 w-5" />
          ) : (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              New Playlist
            </>
          )}
        </Button>
      </div>

      <Separator />

      {/* Playlist content - Using ScrollableMenu */}
      <div className="flex-1 overflow-hidden">
        <ScrollableMenu maxHeight="calc(100vh - 120px)" className="h-full">
          <div className={cn("py-2", isCollapsed && "hidden")}>
            {library.map((folder) => (
              <PlaylistFolder
                key={folder.id}
                folder={folder}
                onTrackSelect={onTrackSelect}
                currentTrackId={currentTrackId}
              />
            ))}
          </div>
        </ScrollableMenu>
      </div>

      {/* New playlist dialog */}
      <Dialog open={isNewFolderDialogOpen} onOpenChange={setIsNewFolderDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create new playlist</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Playlist name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newFolderName.trim()) {
                  handleCreateFolder();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewFolderDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim()}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlaylistSidebar;
