
import { useState, useRef } from 'react';
import { ChevronRight, ChevronDown, Folder, ListMusic, MoreVertical, FolderPlus, Pencil, Trash2 } from 'lucide-react';
import { Folder as FolderType, Track } from '../data/sampleTracks';
import { usePlaylist } from '../contexts/PlaylistContext';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface PlaylistFolderProps {
  folder: FolderType;
  depth?: number;
  onTrackSelect: (track: Track) => void;
  currentTrackId?: string;
}

const PlaylistFolder: React.FC<PlaylistFolderProps> = ({
  folder,
  depth = 0,
  onTrackSelect,
  currentTrackId,
}) => {
  const { 
    expandedFolders, 
    toggleFolder,
    draggedItem,
    setDraggedItem,
    handleDrop,
    createNewFolder,
    deleteFolder,
    renameFolder
  } = usePlaylist();
  
  const [newFolderName, setNewFolderName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [renamingValue, setRenamingValue] = useState(folder.name);
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  
  const folderRef = useRef<HTMLDivElement>(null);
  
  const isExpanded = expandedFolders.includes(folder.id);
  const hasSubItems = folder.tracks.length > 0 || folder.folders.length > 0;
  
  const handleFolderClick = () => {
    toggleFolder(folder.id);
  };

  const handleNewFolderSubmit = () => {
    createNewFolder(folder.id, newFolderName);
    setNewFolderName('');
    setIsNewFolderDialogOpen(false);
    // Auto-expand the folder where we just added a new subfolder
    if (!isExpanded) {
      toggleFolder(folder.id);
    }
  };

  const handleRenameSubmit = () => {
    renameFolder(folder.id, renamingValue);
    setIsRenameDialogOpen(false);
  };

  const handleDeleteSubmit = () => {
    deleteFolder(folder.id);
    setIsDeleteDialogOpen(false);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, type: 'folder', id: string) => {
    e.stopPropagation();
    setDraggedItem(type, id, folder.parent || 'root');
    if (e.dataTransfer) {
      e.dataTransfer.setData('text/plain', id);
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleTrackDragStart = (e: React.DragEvent, trackId: string) => {
    e.stopPropagation();
    setDraggedItem('track', trackId, folder.id);
    if (e.dataTransfer) {
      e.dataTransfer.setData('text/plain', trackId);
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (folderRef.current) {
      folderRef.current.classList.add('bg-gray-light/20');
    }
  };

  const handleDragLeave = () => {
    if (folderRef.current) {
      folderRef.current.classList.remove('bg-gray-light/20');
    }
  };

  const handleDragEnd = () => {
    if (folderRef.current) {
      folderRef.current.classList.remove('bg-gray-light/20');
    }
  };

  const handleDropEvent = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleDragLeave();
    handleDrop(folder.id);
  };

  // Don't allow dropping on the source folder or its children
  const isDroppable = () => {
    if (!draggedItem.id || !draggedItem.type) return false;
    
    if (draggedItem.type === 'folder') {
      // Cannot drop a folder into itself or its descendants
      if (draggedItem.id === folder.id) return false;
      
      // Check if this folder is a descendant of the dragged folder
      const isDescendant = (parentId: string | undefined): boolean => {
        if (!parentId) return false;
        if (parentId === draggedItem.id) return true;
        
        // Recursively check parent folders
        const parentFolder = findFolderById(parentId);
        if (!parentFolder) return false;
        
        return isDescendant(parentFolder.parent);
      };
      
      return !isDescendant(folder.id);
    }
    
    return true;
  };

  const findFolderById = (folderId: string): FolderType | null => {
    // This is simplified - in a real app, you'd want to search the entire library
    if (folder.id === folderId) return folder;
    
    for (const subFolder of folder.folders) {
      const found = subFolder.id === folderId ? subFolder : null;
      if (found) return found;
    }
    
    return null;
  };

  return (
    <div className="select-none animate-fade-in">
      {/* Folder header */}
      <div 
        ref={folderRef}
        className={`flex items-center px-2 py-1.5 rounded-md cursor-pointer transition-all duration-200
          hover:bg-gray-light/60 gap-1
          ${depth > 0 ? 'ml-' + (depth * 4) : ''}
          ${draggedItem.type && isDroppable() ? 'border-2 border-dashed border-coffee/50' : ''}`}
        onClick={handleFolderClick}
        draggable={true}
        onDragStart={(e) => handleDragStart(e, 'folder', folder.id)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDragEnd={handleDragEnd}
        onDrop={handleDropEvent}
      >
        <button className="text-coffee-dark p-0.5">
          {hasSubItems && (
            isExpanded 
              ? <ChevronDown size={16} className="transition-transform duration-200" /> 
              : <ChevronRight size={16} className="transition-transform duration-200" />
          )}
        </button>
        
        <Folder size={16} className="text-coffee mr-1.5" />
        
        {isRenaming ? (
          <input
            type="text"
            value={renamingValue}
            onChange={(e) => setRenamingValue(e.target.value)}
            onBlur={() => {
              if (renamingValue.trim()) {
                renameFolder(folder.id, renamingValue);
              }
              setIsRenaming(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && renamingValue.trim()) {
                renameFolder(folder.id, renamingValue);
                setIsRenaming(false);
              }
              if (e.key === 'Escape') {
                setRenamingValue(folder.name);
                setIsRenaming(false);
              }
            }}
            className="bg-white border border-gray-light rounded px-1 py-0.5 text-sm flex-1 focus:outline-none focus:ring-1 focus:ring-coffee"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="text-coffee-dark font-medium truncate flex-1">{folder.name}</span>
        )}
        
        <span className="text-gray text-xs mr-2">{folder.tracks.length} tracks</span>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <MoreVertical size={14} />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              setIsRenaming(true);
            }}>
              <Pencil size={14} className="mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              setIsNewFolderDialogOpen(true);
            }}>
              <FolderPlus size={14} className="mr-2" />
              New Subfolder
            </DropdownMenuItem>
            {folder.id !== 'device-root' && folder.id !== 'Chill-lofi' && folder.id !== 'Artists' && (
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDeleteDialogOpen(true);
                }}
                className="text-destructive"
              >
                <Trash2 size={14} className="mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* New folder dialog */}
      <Dialog open={isNewFolderDialogOpen} onOpenChange={setIsNewFolderDialogOpen}>
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
                  handleNewFolderSubmit();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewFolderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleNewFolderSubmit} disabled={!newFolderName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Folder name"
              value={renamingValue}
              onChange={(e) => setRenamingValue(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && renamingValue.trim()) {
                  handleRenameSubmit();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameSubmit} disabled={!renamingValue.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete "{folder.name}"?</p>
            <p className="text-sm text-gray-dark mt-1">This will delete the folder and all its contents.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSubmit}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isExpanded && (
        <div className="mt-1 space-y-0.5 animate-accordion-down">
          {/* Tracks */}
          {folder.tracks.map((track) => (
            <div
              key={track.id}
              className={`flex items-center px-2 py-1.5 rounded-md cursor-pointer 
                ${currentTrackId === track.id ? 'bg-coffee/20 text-coffee-dark' : 'hover:bg-gray-light/60'}
                transition-colors ${depth > 0 ? 'ml-' + ((depth + 1) * 4) : 'ml-4'}`}
              onClick={() => onTrackSelect(track)}
              draggable={true}
              onDragStart={(e) => handleTrackDragStart(e, track.id)}
            >
              <ListMusic size={14} className="mr-2 flex-shrink-0 text-coffee-dark/70" />
              <div className="truncate flex-1 min-w-0">
                <div className="truncate font-medium text-sm">{track.title}</div>
                <div className="text-gray-dark text-xs truncate">{track.artist}</div>
              </div>
              <div className="text-gray text-xs">{track.duration}</div>
            </div>
          ))}
          
          {/* Subfolders */}
          {folder.folders.map((subfolder) => (
            <PlaylistFolder
              key={subfolder.id}
              folder={subfolder}
              depth={depth + 1}
              onTrackSelect={onTrackSelect}
              currentTrackId={currentTrackId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PlaylistFolder;
