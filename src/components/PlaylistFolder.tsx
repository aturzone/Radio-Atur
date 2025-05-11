
import { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, ListMusic } from 'lucide-react';
import { Folder as FolderType, Track } from '../data/sampleTracks';

interface PlaylistFolderProps {
  folder: FolderType;
  depth?: number;
  onTrackSelect: (track: Track) => void;
  currentTrackId?: string;
  expandedFolders?: string[];
  onFolderToggle?: (folderId: string) => void;
}

const PlaylistFolder: React.FC<PlaylistFolderProps> = ({
  folder,
  depth = 0,
  onTrackSelect,
  currentTrackId,
  expandedFolders = [],
  onFolderToggle,
}) => {
  const isExpanded = expandedFolders?.includes(folder.id);
  const hasSubItems = folder.tracks.length > 0 || folder.folders.length > 0;
  
  const handleFolderClick = () => {
    if (onFolderToggle) {
      onFolderToggle(folder.id);
    }
  };

  return (
    <div className="select-none">
      <div 
        className={`flex items-center px-2 py-1.5 rounded-md cursor-pointer hover:bg-gray-light/60 transition-colors gap-1
          ${depth > 0 ? 'ml-' + (depth * 4) : ''}`}
        onClick={handleFolderClick}
      >
        <button className="text-coffee-dark p-0.5">
          {hasSubItems && (isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
        </button>
        <Folder size={16} className="text-coffee mr-1.5" />
        <span className="text-coffee-dark font-medium truncate">{folder.name}</span>
        <span className="text-gray text-xs ml-auto">{folder.tracks.length} tracks</span>
      </div>

      {isExpanded && (
        <div className="mt-1 space-y-0.5">
          {folder.tracks.map((track) => (
            <div
              key={track.id}
              className={`flex items-center px-2 py-1.5 rounded-md cursor-pointer 
                ${currentTrackId === track.id ? 'bg-coffee/20 text-coffee-dark' : 'hover:bg-gray-light/60'}
                transition-colors ${depth > 0 ? 'ml-' + ((depth + 1) * 4) : 'ml-4'}`}
              onClick={() => onTrackSelect(track)}
            >
              <ListMusic size={14} className="mr-2 flex-shrink-0 text-coffee-dark/70" />
              <div className="truncate flex-1 min-w-0">
                <div className="truncate font-medium text-sm">{track.title}</div>
                <div className="text-gray-dark text-xs truncate">{track.artist}</div>
              </div>
              <div className="text-gray text-xs">{track.duration}</div>
            </div>
          ))}
          
          {folder.folders.map((subfolder) => (
            <PlaylistFolder
              key={subfolder.id}
              folder={subfolder}
              depth={depth + 1}
              onTrackSelect={onTrackSelect}
              currentTrackId={currentTrackId}
              expandedFolders={expandedFolders}
              onFolderToggle={onFolderToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PlaylistFolder;
