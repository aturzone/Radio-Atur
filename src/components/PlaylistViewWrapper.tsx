
import React from 'react';
import { Track } from '../data/sampleTracks';
import PlaylistView from './PlaylistView';

interface PlaylistViewWrapperProps {
  onTrackSelect: (track: Track) => void;
  currentTrackId: string | null;
}

// This wrapper component takes the props we need and passes them to PlaylistView
const PlaylistViewWrapper: React.FC<PlaylistViewWrapperProps> = ({
  onTrackSelect,
  currentTrackId
}) => {
  return (
    <PlaylistView 
      onTrackSelect={onTrackSelect}
      currentTrackId={currentTrackId || ""} 
    />
  );
};

export default PlaylistViewWrapper;
