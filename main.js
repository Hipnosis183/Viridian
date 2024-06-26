// Import Electron elements.
const { app, BrowserWindow } = require('electron');

// Create app window.
const createWindow = () => {
  const win = new BrowserWindow({
    width: process.env.NODE_ENV ? 1330 : 1080,
    height: 680,
    show: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      webSecurity: false,
    },
  });
  // Manage fullscreen state.
  let fullscreen = false;
  win.once('fullscreen', (value) => { if (value) { fullscreen = true; } });
  // Render window once it finished loading.
  win.once('ready-to-show', () => { win.show(); win.setFullScreen(fullscreen); });
  // Disable manu bar display.
  win.setMenuBarVisibility(false);
  // Manage app loading.
  if (process.env.NODE_ENV) {
    win.loadURL('http://localhost:4200');
    win.webContents.openDevTools();
  } else {
    win.loadFile('.vite/browser/index.html');
  }
};

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) { createWindow(); }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => { createWindow(); });

app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with 'Cmd + Q'.
  if (process.platform !== 'darwin') { app.quit(); }
});

// IPC listeners for remote access of node modules.
require('./remote.js');