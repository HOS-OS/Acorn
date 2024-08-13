const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow;
let aboutWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 850,
    minHeight: 500,
    minWidth: 800,
    webPreferences: {
      webviewTag: true,
      nodeIntegration: true, // Ensure this is set if you're using `nodeIntegration` in `about.html`
      contextIsolation: false,
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.setMenuBarVisibility(false);

  // Create and set the application menu
  const menu = Menu.buildFromTemplate(createMenuTemplate());
  Menu.setApplicationMenu(menu);
};

const createMenuTemplate = () => {
  return [
    {
      label: 'File',
      submenu: [
        {
          label: 'About',
          click() {
            if (aboutWindow) {
              aboutWindow.focus();
            } else {
              createAboutWindow();
            }
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        {
          label: 'Close',
          role: 'close',
        }
      ]
    }
  ];
};

const createAboutWindow = () => {
  aboutWindow = new BrowserWindow({
    width: 400,
    height: 400,
    modal: true,
    parent: mainWindow,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    frame: false, // Disable the default title bar
    titleBarStyle: 'hidden', // Hide the native title bar
    backgroundColor: '#fff' // Set a background color
  });

  aboutWindow.loadFile(path.join(__dirname, 'about.html'));

  // Cleanup when the About window is closed
  aboutWindow.on('closed', () => {
    aboutWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Intercept new windows and make them do nothing (new windows are handled
// in `browser.js` by opening new tabs)
app.on('web-contents-created', function (event, contents) {
  if (contents.getType() === 'webview') {
    contents.on('new-window', function (newWindowEvent) {
      newWindowEvent.preventDefault();
    });
  }
});

// Auto reload the app on files changes
try {
  require('electron-reloader')(module);
} catch (_) {}
