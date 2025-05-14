# Bug Tracking Document for Cozy Audio Café

## Table of Contents
1. [Introduction](#introduction)
2. [Active Bugs](#active-bugs)
3. [Fixed Bugs](#fixed-bugs)
4. [Testing Procedures](#testing-procedures)
5. [Contributing](#contributing)

## Introduction

This document tracks bugs encountered in the Cozy Audio Café music player application along with their status, fixes, and relevant information. It serves as a knowledge base for developers and testers.

## Active Bugs

| ID | Bug Description | Files Affected | Severity | Reported Date | Status |
|----|----------------|----------------|----------|--------------|--------|
| B001 | ScrollableMenu component doesn't handle variable height content properly | `src/components/ScrollableMenu.tsx` | Medium | 2025-05-14 | Investigating |
| B002 | Sidebar playlist items don't animate expansion smoothly | `src/components/PlaylistFolder.tsx` | Low | 2025-05-14 | Pending |
| B003 | Some audio files not detected during import | `src/utils/fileSystem.ts` | High | 2025-05-14 | In Progress |

## Fixed Bugs

| ID | Bug Description | Files Affected | Fix Description | Fixed Date | Fixed By |
|----|----------------|----------------|----------------|------------|----------|
| F001 | PlaylistViewWrapper component throws type error | `src/components/PlaylistViewWrapper.tsx` | Added proper interface for props | 2025-05-14 | Dev Team |
| F002 | Google Drive integration missing required properties | `src/contexts/GoogleIntegrationContext.tsx` | Added missing properties to context | 2025-05-14 | Dev Team |
| F003 | Export icon unavailable in lucide-react | `src/pages/MusicLibrary.tsx` | Replaced with ExternalLink icon | 2025-05-14 | Dev Team |

### F001: PlaylistViewWrapper Component Type Error

**Problem**: The `PlaylistViewWrapper` component didn't have the correct type definitions for its props, causing TypeScript errors.

**Files Affected**:
- `src/components/PlaylistViewWrapper.tsx`

**Fix**:
```typescript
// Added proper interface for props
interface PlaylistViewWrapperProps {
  onTrackSelect: (track: Track) => void;
  currentTrackId: string;
}

const PlaylistViewWrapper: React.FC<PlaylistViewWrapperProps> = ({ onTrackSelect, currentTrackId }) => {
  // ...component implementation
};
```

**Fixed On**: 2025-05-14

### F002: Google Drive Integration Missing Properties

**Problem**: The Google Drive integration context was missing required properties.

**Files Affected**:
- `src/contexts/GoogleIntegrationContext.tsx`

**Fix**:
```typescript
// Added missing properties to context interface
export interface GoogleIntegrationContextProps {
  // ...existing properties
  isLoading: boolean;
  playlists: Folder[];
  scanDriveForMusic: () => Promise<void>;
}

// Added implementation for the missing properties
const GoogleIntegrationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ...existing code
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [playlists, setPlaylists] = useState<Folder[]>([]);
  
  // Added implementation for scanDriveForMusic function
  const scanDriveForMusic = useCallback(async () => {
    // Implementation details
  }, [isConnected, connect]);
  
  return (
    <GoogleIntegrationContext.Provider
      value={{
        // ...existing properties
        isLoading,
        playlists,
        scanDriveForMusic
      }}
    >
      {children}
    </GoogleIntegrationContext.Provider>
  );
};
```

**Fixed On**: 2025-05-14

### F003: Export Icon Missing

**Problem**: The `Export` icon was not available in the lucide-react library.

**Files Affected**:
- `src/pages/MusicLibrary.tsx`

**Fix**:
```typescript
// Changed import from:
import { Export } from 'lucide-react';

// To:
import { ExternalLink } from 'lucide-react';

// And updated usage:
<Button variant="outline" size="icon" onClick={() => setExportDialogOpen(true)}>
  <ExternalLink className="h-4 w-4" />
  <span className="sr-only">Export</span>
</Button>
```

**Fixed On**: 2025-05-14

## Testing Procedures

### Backup & Restore Testing
1. Create a backup with various playlists and tracks
2. Verify the backup file is created in the selected location
3. Modify the library (add/delete tracks)
4. Restore the backup
5. Verify all playlists and tracks are restored correctly

### Scrolling Behavior Testing
1. Add many items to a playlist to trigger scrolling
2. Test scrolling with mouse wheel, touchpad, and touch gestures
3. Verify all items are accessible via scrolling
4. Test keyboard navigation (arrow keys, Tab)

## Contributing

When fixing bugs, please follow these guidelines:
1. Document the bug in this file
2. Create a detailed description of both the problem and solution
3. Include all affected files
4. Update the status when fixed
5. Add tests when applicable to prevent regression

Last updated: 2025-05-14
