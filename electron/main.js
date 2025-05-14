const { app, BrowserWindow, protocol, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const url = require('url');

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, '../public/app-icon-animated.svg'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the app
  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../dist/index.html'),
    protocol: 'file:',
    slashes: true
  });
  
  mainWindow.loadURL(startUrl);

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Handle window closing
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// Initialize app
app.whenReady().then(() => {
  protocol.registerFileProtocol('file', (request, callback) => {
    const pathname = decodeURI(request.url.replace('file:///', ''));
    callback(pathname);
  });

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Handle file system access
ipcMain.handle('list-directory', async (event, dirPath) => {
  try {
    const files = await fs.promises.readdir(dirPath);
    const stats = await Promise.all(
      files.map(async file => {
        const filePath = path.join(dirPath, file);
        const stat = await fs.promises.stat(filePath);
        return {
          name: file,
          path: filePath,
          isDirectory: stat.isDirectory(),
          size: stat.size,
          modified: stat.mtime
        };
      })
    );
    return stats;
  } catch (error) {
    console.error('Error listing directory:', error);
    return [];
  }
});

// Handle audio file scanning
ipcMain.handle('scan-audio-files', async (event, startPath) => {
  const audioExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac'];
  const results = [];

  async function scanDirectory(dirPath) {
    try {
      const files = await fs.promises.readdir(dirPath);
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = await fs.promises.stat(filePath);
        
        if (stats.isDirectory()) {
          await scanDirectory(filePath);
        } else {
          const ext = path.extname(file).toLowerCase();
          if (audioExtensions.includes(ext)) {
            results.push({
              name: file,
              path: filePath,
              size: stats.size,
              modified: stats.mtime
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dirPath}:`, error);
    }
  }

  await scanDirectory(startPath || app.getPath('music'));
  return results;
});
