const {app, BrowserWindow, ipcMain, TouchBar} = require('electron');
const { TouchBarLabel, TounchBarButton, TouchBarSpacer } = TouchBar
const menubar = require('menubar')
const path = require('path')
const {distPath} = require('../../dev/path');

const { exec, spawn } = require('child_process');
const Moment = require('moment');

const mb = new menubar({
  index: `file:///Users/takumishinoda/Documents/Platformio/Projects/ESP_env_monitor/computer_client/src/app/index.html`
});

function timeover(milli, callback){
  return new Promise((res, rej) => {
    let timer = setTimeout(() => {
      rej('Time out.') ;
    }, milli);
    
    callback(res, rej, timer);
  });
}

mb.on('ready', () => {
  // mb.showWindow();
});


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
      let resultJson =  JSON.parse(result);
      let moment = Moment().format('YYYY-MM-DD HH:mm:ss');

      console.log(resultJson)
      resultJson.sensorInfos.moment = moment;
      mainWindow.webContents.send('updateSensorInfos', {data: resultJson});
      tempTounchLabel.label = `${resultJson.sensorInfos.adjTempAve}°C`;
      humidityTounchLabel.label = `${resultJson.sensorInfos.humidity}%`
      pressureTouchLabel.label = `${parseInt(resultJson.sensorInfos.pressure) / 100}hPa`
    })
    .catch((err) => {
      if(ble_proc != null) ble_proc.kill();
      console.log(err);
    });
  }, 5000);
});
