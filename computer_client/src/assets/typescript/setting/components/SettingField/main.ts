import Dashboard from './Dashboard'
import WiFiTab from './WiFi'
import BLETab from './BLE'
import SensorTab from './Sensor'

interface SettingFieldInterface{
  render(id: number, prop: {}): void
}

const dashboard = new Dashboard($)
const wifiTab = new WiFiTab($)
const bleTab = new BLETab($)
const sensorTab = new SensorTab($)

export default class SettingField implements SettingFieldInterface{
  private $: JQueryStatic
  private TargetId: string 

  constructor(id: string, _$: JQueryStatic){
    this.$ = _$
    this.TargetId = id
  }

  render(id: number, prop: {}){
    switch(id){
      case 0: 
        $('#' + this.TargetId).append(dashboard.renderElement({}))
        dashboard.applyStyle()
        break
      case 1: 
        $('#' + this.TargetId).append(wifiTab.renderElement({}))
        wifiTab.applyStyle()
        break
      case 2: 
        $('#' + this.TargetId).append(bleTab.renderElement({}))
        bleTab.applyStyle()
        break
      case 3: 
        $('#' + this.TargetId).append(sensorTab.renderElement({}))
        sensorTab.applyStyle()
        break
      default: break
    }
  }
}