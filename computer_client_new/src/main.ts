import { BrowserWindow, app, App, ipcMain } from 'electron'
import { spawn, ChildProcess, SpawnOptions, ChildProcessWithoutNullStreams } from 'child_process'
import Moment from 'moment';

class ClientApp {
  private mainWindow: BrowserWindow | null = null
  private app: App
  private mainURL: string = `file://${__dirname}/../src/renderer/views/index.html`

  constructor(app: Electron.App) {
    this.app = app
    this.app.on('window-all-closed', this.onWindowAllClosed.bind(this))
    this.app.on('ready', this.create.bind(this))
    this.app.on('activate', this.onActivated.bind(this))
  }

  private onWindowAllClosed() {
    this.app.quit()
  }

  private async create() {
    this.mainWindow = new BrowserWindow({
      width: 800,
      height: 400,
      minWidth: 500,
      minHeight: 200,
      acceptFirstMouse: true,
      webPreferences: { nodeIntegration: true }
    })

    await this.mainWindow.loadURL(this.mainURL)
    this.setupBLEProcess()

    this.mainWindow.on('closed', () => {
      this.mainWindow = null
    })
  }

  private timeover(milli: number, callback: (res: any, rej: any, timer: any) => void){
    return new Promise((res, rej) => {
      let timer = setTimeout(() => {
        rej('Time out.') ;
      }, milli);
      
      callback(res, rej, timer);
    });
  }

  private setupBLEProcess(): void{
    setInterval(() => {
      let ble_proc: ChildProcessWithoutNullStreams

      this.timeover(4000, (time_res: any, time_rej: any, timer: any) => {
        ble_proc = spawn('node', ['./ble_test.js'])
  
        ble_proc.stdout.on('data', (data: any) => {
          clearTimeout(timer);
          time_res(data);
        });
        ble_proc.stderr.on('data', (err: any) => {
          clearTimeout(timer);
          time_rej(err);
        });
      })
      .then((result: any) => {
        let resultJson =  JSON.parse(result);
        let moment = Moment().format('YYYY-MM-DD HH:mm:ss');
  
        console.log('resultJson', resultJson)
        resultJson.sensorInfos.moment = moment;
        if(this.mainWindow == undefined) return 
        this.mainWindow.webContents.send('updateSensorInfos', {data: resultJson});
        // tempTounchLabel.label = `${resultJson.sensorInfos.adjTempAve}°C`;
        // humidityTounchLabel.label = `${resultJson.sensorInfos.humidity}%`
        // pressureTouchLabel.label = `${parseInt(resultJson.sensorInfos.pressure) / 100}hPa`
      })
      .catch((err: Buffer) => {
        if(ble_proc != null) ble_proc.kill();
        console.log('Error', err.toString());
      });
    }, 5000);
  }

  private onActivated(){
    if (this.mainWindow === null) {
      this.create()
    }
  }
}

const WindowApp: ClientApp = new ClientApp(app)