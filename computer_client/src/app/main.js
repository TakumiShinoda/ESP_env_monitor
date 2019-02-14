const {app, BrowserWindow, ipcMain, TouchBar} = require('electron');
const {  TouchBarLabel, TounchBarButton, TouchBarSpacer } = TouchBar
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

  const tempTounchLabel = new TouchBarLabel();
  const humidityTounchLabel = new TouchBarLabel();
  const pressureTouchLabel = new TouchBarLabel();
  tempTounchLabel.label = '0°C';
  humidityTounchLabel.label = '0%';
  pressureTouchLabel.label = '0hPa'

  const touchBar = new TouchBar([
    tempTounchLabel,
    new TouchBarSpacer({size: 'small'}),
    humidityTounchLabel,
    new TouchBarSpacer({size: 'small'}),
    pressureTouchLabel
  ]);

  mainWindow.setTouchBar(touchBar)
 
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
      tempTounchLabel.label = `${resultArr[3]}°C`;
      humidityTounchLabel.label = `${resultArr[5]}%`
      pressureTouchLabel.label = `${parseInt(resultArr[6]) / 100}hPa`
    })
    .catch((err) => {
      if(ble_proc != null) ble_proc.kill();
      console.log(err);
    });
  }, 5000);
});
