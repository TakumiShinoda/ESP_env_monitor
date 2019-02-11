import $ = require('jquery')
import { ipcRenderer } from 'electron'

import Menubar from './components/Menubar/main'
import SettingField from './components/SettingField/main'
import { SensorObj } from './components/SettingField/Sensor'

import '../../css/setting/styles.css'

let menubar = new Menubar('menubarArea', $)
let settingField = new SettingField('mainField', $)

function openSetting(index: number){
  menubar.changeFocus(index)
  settingField.render(index, {})
}

$(document).ready(() => {
  menubar.registerMenuClickEvent((ele: any, index: number) => {
    $('#mainField').empty()
    settingField.render(index, {})
  })

  menubar.render()
  openSetting(3)
  // settingField.SensorTab.reloadSensorInfo({rawTemp: '20', rawTempAve: '20'})

  ipcRenderer.on('updateSensorInfos', (ev: any, args: {data: string[]}) => {
    console.log(args)
    if(args.data.length == 8){
      let sensorObj: SensorObj​​ = {
        rawTemp: args.data[0], 
        rawTempAve: args.data[1], 
        adjTemp: args.data[2],
        adjTempAve: args.data[3],
        cpuTemp: args.data[4],
        humidity: args.data[5],
        pressure: args.data[6],
        moment: args.data[7]
      }
      settingField.SensorTab.reloadSensorInfo(sensorObj)
    }
  })
})  