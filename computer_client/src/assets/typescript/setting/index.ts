import $ = require('jquery')
import { ipcRenderer} from 'electron'

import Menubar from './components/Menubar/main'
import SettingField from './components/SettingField/main'
import { SensorObj } from './components/SettingField/Sensor'

import '../../css/setting/styles.css'

let menuBar = new Menubar('menubarArea', $)
let settingField = new SettingField('mainField', $)
let SensorBuff​​: SensorObj = {
  rawTemp: ``,
  rawTempAve: ``,
  adjTemp: ``,
  adjTempAve: ``,
  cpuTemp: ``,
  humidity: ``,
  pressure: ``,
  moment: ``,
}

function openSetting(index: number){
  menuBar.changeFocus(index)
  settingField.render(index, {})
} 

$(document).ready(() => {
  menuBar.registerMenuClickEvent((ele: any, index: number) => {
    $('#mainField').empty()
    settingField.render(index, {})
  })

  menuBar.render()
  openSetting(0)
  // settingField.SensorTab.reloadSensorInfo({rawTemp: '20', rawTempAve: '20'})

  setInterval(() => {
    settingField.Dashboard.updateOverviewList(SensorBuff)
    settingField.SensorTab.reloadSensorInfo(SensorBuff)
  }, 100)

  ipcRenderer.on('updateSensorInfos', (ev: any, args: any) => {
    // console.log('hoge', args.data.sensorInfos)
    SensorBuff = args.data.sensorInfos
  })
})  