
import React from 'react';
import { usePlaylist } from '../contexts/PlaylistContext';
import { Track } from '../data/sampleTracks';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Heart, Pencil, Trash2, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SongOptionsMenuProps {
  track: Track;
  disableDelete?: boolean;
  onEdit?: () => void;
}

const SongOptionsMenu: React.FC<SongOptionsMenuProps> = ({ 
  track, 
  disableDelete = false,
  onEdit 
}) => {
  const { addToFavorites, isTrackInFavorites } = usePlaylist();
  const navigate = useNavigate();
  
  const isFavorite = isTrackInFavorites(track.id);
  
  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToFavorites(track.id);
    
    toast.success(
      isFavorite 
        ? `Removed "${track.title}" from favorites` 
        : `Added "${track.title}" to favorites`
    );
  };
  
  const handlePlayNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate home with this track selected
    navigate(`/?track=${track.id}`);
  };
  
  const handleEditTrack = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit();
    } else {
      // Navigate to the music library with this track selected for editing
      navigate(`/music-library?edit=${track.id}`);
    }
  };
  
  const handleDeleteTrack = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement actual track deletion
    toast.error(`Delete functionality not yet implemented`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">More options</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handlePlayNow}>
          <PlayCircle className="mr-2 h-4 w-4" />
          Play now
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleFavoriteToggle}>
          <Heart 
            className={`mr-2 h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} 
          />
          {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleEditTrack}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit track info
        </DropdownMenuItem>
        
        {!disableDelete && (
          <DropdownMenuItem 
            className="text-red-600" 
            onClick={handleDeleteTrack}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove from library
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SongOptionsMenu;
