<p><b> Radio Atur </b></p>

<p align="center">
  <img src="/public/app-icon-animated.gif" alt="Cozy Audio Café Logo" width="128" height="128" />
</p>

A calm, relaxing music player web app inspired by the ambiance of cozy bookshops. Perfect for creating a pleasant atmosphere while reading, working, or relaxing. Now available for multiple platforms including web, Android, Windows, and Linux.

## ✨ Features

- 🎵 Clean, minimalist music player interface
- 📱 Cross-platform support (Web, Android, Windows, Linux)
- 📁 Folder-based playlist organization
- 🌓 Dark/Light mode toggle
- 🎨 Multiple theme options
- 📋 Song management (add, delete, edit)
- 🔄 Google Drive sync and backup
- 🔍 System scan for audio files
- 📊 Track visualization
- 📻 Radio streaming
- 🔊 Volume and playback controls
- 💾 Import/export backup functionality
- ☕ "Buy Me a Coffee" support link

## 📥 Installation

### Web Version
SOON...

### Android
1. Download the `.apk` file from the `/installers` directory
2. Enable "Install from Unknown Sources" in your Android settings
3. Open the downloaded APK file to install
4. Launch from your app drawer

### Windows
1. Download the `.exe` installer from the `/installers` directory
2. Run the installer and follow the on-screen instructions
3. Launch from desktop shortcut or start menu

### Linux (Debian-based)
1. Download the `.deb` package from the `/installers` directory
2. Install using:
   ```bash
   sudo dpkg -i cozy-audio-cafe.deb
   sudo apt-get install -f  # To resolve dependencies
   ```
3. Launch from your applications menu

## 🎧 Using Cozy Audio Café

### Basic Usage
1. Launch the app
2. The player will automatically scan for music on first launch
3. Use the folder browser to navigate your music collection
4. Click on any track to start playing

### Google Drive Sync
1. Click on the "Login with Gmail" button
2. Allow the requested permissions
3. Use "Sync with Drive" to sync your library to Google Drive
4. Use "Backup All" to create a complete backup

### Importing a Backup
1. Go to Settings
2. Click "Import Backup"
3. Select your backup file or folder
4. Wait for the restoration to complete

## 🔄 Syncing Between Devices

1. Create a backup on your source device using "Backup All"
2. Transfer the backup to your target device
3. Use "Import Backup" on the target device
4. Alternatively, use Google Drive sync on both devices

## 📷 Screenshots

![Player Interface](https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400)
![Playlist View](https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400)

## 🛠️ Development

### Prerequisites
- Node.js (v14.0 or higher)
- npm or yarn

### Building from Source
```bash
# Clone the repository
git clone https://github.com/yourusername/cozy-audio-cafe.git
cd cozy-audio-cafe

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📱 Building Mobile App
```bash
# Build for Android
npm run build
npx cap sync android
npx cap open android

# Build for iOS (macOS only)
npm run build
npx cap sync ios
npx cap open ios
```

## 📃 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💖 Support

If you enjoy using Cozy Audio Café, consider supporting the project by clicking the "Buy Me a Coffee" button in the app.

## 🙏 Acknowledgments

- Music samples by various artists
- UI components powered by Shadcn UI
- Icons by Lucide React
- Cross-platform capabilities by Capacitor
