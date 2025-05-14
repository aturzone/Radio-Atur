
# Cozy Audio Café

A relaxing music player application with Google Drive integration for syncing your music library across devices.

## Features

- Play local music files with a beautiful, responsive interface
- Google Drive integration for backup and sync
- Radio stations for continuous streaming
- Multiple theme options (Day, Night, Study, and Party modes)
- Customizable settings
- Feedback system
- Device music scanning with audio file filtering

## Folder Structure

```
src/
├── components/         # UI components
│   ├── player/         # Music player components
│   └── ui/             # Reusable UI components
├── contexts/           # React context providers
├── data/               # Sample data and types
├── hooks/              # Custom React hooks
├── lib/                # Utility library functions
├── pages/              # Application pages
│   ├── Index.tsx       # Home page with music player
│   ├── Radio.tsx       # Radio streaming page
│   └── Settings.tsx    # Settings page
├── types/              # TypeScript type definitions
└── utils/              # Helper utility functions
```

## Google Drive Integration

The application integrates with Google Drive to sync your music library and settings across devices. The integration offers:

### Gmail-Based Login
- Log in with your Google account
- Seamless authorization with OAuth

### Manual Sync Options
- **Sync to Drive**: Synchronize your current music library with Google Drive
- **Backup All**: Create a complete backup with timestamps of your library, playlists, and app settings
- **Import Backup**: Restore your music collection from a previous backup

### Folder Organization
When you sync with Google Drive, the app creates:
- A "CozyAudioCafe_Music" folder for your music library
- A "CozyAudioCafe_Backups" folder for timestamped full backups

## Development

This project is built with:

- React
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Vite as the build tool

## Building and Running

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```
