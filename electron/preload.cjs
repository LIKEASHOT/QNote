const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  toggleMaximize: () => ipcRenderer.send('window-maximize-toggle'),
});
