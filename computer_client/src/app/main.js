const {app, BrowserWindow, ipcMain} = require('electron');
const {distPath} = require('../../dev/path');

const { exec, spawn } = require('child_process');
const Moment = require('moment');

function timeover(milli, callback){
  return new Promise((res, rej) => {
    let timer = setTimeout(() => {
      rej('Time out.');
    }, milli);
    
    callback(res, rej, timer);
  });
}

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 640,
    height: 480,
    resizable: true,
    movable: true,
  });
  mainWindow.loadURL('file://' + distPath.views('/setting/index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  setInterval(() => {
    let ble_proc = null;

    timeover(4000, (time_res, time_rej, timer) => {
      ble_proc = spawn('node', ['./ble_test.js'])

      ble_proc.stdout.on('data', (data) => {
        clearTimeout(timer);
        time_res(data);
      });
      ble_proc.stderr.on('data', (err) => {
        clearTimeout(timer);
        time_rej(err);
      });
    })
    .then((result) => {
      let resultArr = result.toString().split(',');
      let moment = Moment().format('YYYY-MM-DD HH:mm:ss');

      resultArr.push(moment);
      mainWindow.webContents.send('updateSensorInfos', {data: resultArr});
    })
    .catch((err) => {
      if(ble_proc != null) ble_proc.kill();
      console.log(err);
    });
  }, 5000);
});
