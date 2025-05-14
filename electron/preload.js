
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    listDirectory: (path) => ipcRenderer.invoke('list-directory', path),
    scanAudioFiles: (startPath) => ipcRenderer.invoke('scan-audio-files', startPath),
    platform: process.platform
  }
);
