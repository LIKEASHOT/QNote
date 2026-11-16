delete process.env.ELECTRON_RUN_AS_NODE;
const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1240,
    height: 840,
    minWidth: 880,
    minHeight: 600,
    title: 'QNote',
    backgroundColor: '#FAF7F2',
    // macOS Native Traffic Lights integrated directly into TitleBar
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 14 },
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  // Check if running in dev mode or production
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Open external links in default browser instead of the app window
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Window Maximize/Zoom toggle on double-click
ipcMain.on('window-maximize-toggle', () => {
  if (!mainWindow) return;
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

app.whenReady().then(() => {
  if (process.platform === 'darwin' && app.dock) {
    const iconCandidates = [
      path.join(process.resourcesPath, 'icon.png'),
      path.join(__dirname, 'icon.png'),
      path.join(__dirname, '../assets/icon_clean.png'),
      path.join(__dirname, '../assets/icon.png'),
    ];
    for (const p of iconCandidates) {
      if (require('fs').existsSync(p)) {
        try {
          app.dock.setIcon(p);
          break;
        } catch (e) {
          console.error('Failed to set dock icon:', e);
        }
      }
    }
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
