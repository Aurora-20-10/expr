const { app, BrowserWindow, ipcMain, Menu, Tray, shell, Notification, globalShortcut } = require('electron');
const path = require('path');
const ffi = require('ffi-napi');

let mainWindow, overlayWindow, settingsWindow, tray;

// Windows API để di chuyển cửa sổ
const user32 = ffi.Library('user32', {
  FindWindowA: ['int32', ['string', 'string']],
  MoveWindow: ['bool', ['int32', 'int', 'int', 'int', 'int', 'bool']],
});
function moveWindowByTitle(title, x, y, w, h) {
  const hWnd = user32.FindWindowA(null, title);
  if (hWnd !== 0) {
    user32.MoveWindow(hWnd, x, y, w, h, true);
    return true;
  }
  return false;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });
  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();
  createTray();
  registerHotkeys();
});

function createTray() {
  tray = new Tray(path.join(__dirname, 'icons/app.ico'));
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: '📂 Open FancyZones', click: () => mainWindow.show() },
      { type: 'separator' },
      { label: '❌ Exit', click: () => app.quit() },
    ]),
  );
}

function registerHotkeys() {
  globalShortcut.register('Control+Alt+1', () => {
    mainWindow.webContents.send('hotkey-apply-layout', 'Work');
  });
  globalShortcut.register('Control+Alt+2', () => {
    mainWindow.webContents.send('hotkey-apply-layout', 'Study');
  });
}

ipcMain.on('apply-layout', (e, layoutStr) => {
  const layout = JSON.parse(layoutStr);
  layout.zones.forEach((z) => {
    if (z.appOrLink.startsWith('http')) {
      shell.openExternal(z.appOrLink);
    } else if (z.appOrLink) {
      require('child_process').spawn(z.appOrLink, { detached: true, stdio: 'ignore' }).unref();
    }
  });
});

ipcMain.on('show-toast', (e, msg) => {
  new Notification({ title: 'FancyZones Mythic', body: `✅ ${msg}` }).show();
});

ipcMain.on('open-overlay', () => {
  if (!overlayWindow) {
    overlayWindow = new BrowserWindow({
      width: 300,
      height: 400,
      frame: false,
      alwaysOnTop: true,
      transparent: true,
      webPreferences: { nodeIntegration: true, contextIsolation: false },
    });
    overlayWindow.loadFile('overlay.html');
  } else {
    overlayWindow.show();
  }
});
ipcMain.on('open-settings', () => {
  if (!settingsWindow) {
    settingsWindow = new BrowserWindow({
      width: 400,
      height: 300,
      parent: mainWindow,
      modal: true,
      webPreferences: { nodeIntegration: true, contextIsolation: false },
    });
    settingsWindow.loadFile('settings.html');
    settingsWindow.on('closed', () => {
      settingsWindow = null;
    });
  } else {
    settingsWindow.show();
  }
});

ipcMain.on('toggle-mythic-mode', (e, mode) => {
  if (mainWindow) {
    mainWindow.webContents.send('apply-mythic-mode', mode);
  }
});

ipcMain.on('quick-launch', (e, appPath) => {
  if (appPath) {
    require('child_process').spawn(appPath, { detached: true, stdio: 'ignore' }).unref();
  }
});

ipcMain.on('quick-zone', (e, data) => {
  if (data && data.path) {
    require('child_process').spawn(data.path, { detached: true, stdio: 'ignore' }).unref();
  }
});
