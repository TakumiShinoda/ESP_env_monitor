const {app, BrowserWindow} = require('electron');
const {distPath} = require('../../dev/path');

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 640,
    height: 480,
    resizable: true,
    movable: true,
    // transparent: true,
    // titleBarStyle: 'hidden',
    // frame: false,
  });
  mainWindow.loadURL('file://' + distPath.views('/index/index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});
