
# Cozy Audio Café Installers

This directory contains installers for Cozy Audio Café on different platforms.

## Android (.apk)

### Building the APK

1. Make sure you have the Android SDK installed
2. Install Capacitor and the required dependencies:
   ```bash
   npm install @capacitor/core @capacitor/android
   ```
3. Build the web app:
   ```bash
   npm run build
   ```
4. Initialize and sync Capacitor:
   ```bash
   npx cap init
   npx cap add android
   npx cap sync android
   ```
5. Open Android Studio:
   ```bash
   npx cap open android
   ```
6. In Android Studio, select Build > Generate Signed Bundle/APK
7. Follow the wizard to create a signed APK
8. The APK will be placed in `android/app/build/outputs/apk/release/app-release.apk`

### Manual Installation Instructions

1. Copy the APK to your Android device
2. On your device, go to Settings > Security
3. Enable "Unknown Sources"
4. Use a file manager to find and tap the APK file
5. Follow the on-screen instructions to install

## Windows (.exe)

### Building the Windows Installer

1. Install Electron and electron-builder:
   ```bash
   npm install electron electron-builder --save-dev
   ```
2. Build the web app:
   ```bash
   npm run build
   ```
3. Create an Electron main file (already available in `electron/main.js`)
4. Verify electron-builder configuration in package.json
5. Build the installer:
   ```bash
   npx electron-builder --win
   ```
6. The installer will be placed in `dist_electron/`

### Running the Installer

1. Double-click the .exe file
2. Follow the installation wizard
3. Launch from desktop shortcut or start menu

## Linux (.deb)

### Building the Debian Package

1. Install Electron and electron-builder:
   ```bash
   npm install electron electron-builder --save-dev
   ```
2. Build the web app:
   ```bash
   npm run build
   ```
3. Verify electron-builder configuration in package.json
4. Build the .deb package:
   ```bash
   npx electron-builder --linux deb
   ```
5. The .deb file will be placed in `dist_electron/`

### Installing on Debian/Ubuntu

1. Install using dpkg:
   ```bash
   sudo dpkg -i cozy-audio-cafe_1.0.0_amd64.deb
   ```
2. If there are dependency issues:
   ```bash
   sudo apt-get install -f
   ```
3. Launch from Applications menu

## Creating All Installers

When all platforms are required, use:

```bash
# Build web app
npm run build

# Android
npx cap sync android
npx cap open android
# Then build signed APK in Android Studio

# Windows/Linux
npx electron-builder --win --linux deb
```

## Troubleshooting

### Common Issues

1. **API Key Invalid Error** - If you encounter Google API errors, make sure to:
   - Create a proper Google Cloud Platform project
   - Enable the required APIs (Drive, Gmail)
   - Create and configure OAuth consent screen
   - Generate proper API keys and OAuth client IDs
   - Update the API keys in the application

2. **Missing Dependencies** - If the build process fails with missing dependencies:
   ```bash
   npm install --save-dev electron electron-builder @capacitor/android @capacitor/core @capacitor/cli
   ```

3. **Android Build Issues** - Make sure Android Studio is properly set up:
   - Install Android SDK
   - Configure ANDROID_HOME environment variable
   - Install required platform tools

4. **Windows Code Signing** - For production Windows installers, you'll need to:
   - Purchase or obtain a code signing certificate
   - Configure electron-builder to use your certificate

### Performance Optimization

For smooth operation on all platforms:
- Use lower resolution album art for mobile
- Optimize audio files for streaming
- Use IndexedDB for local caching

The generated installers should be placed in this directory for distribution.
