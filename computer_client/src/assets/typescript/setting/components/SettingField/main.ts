import Dashboard from './Dashboard'
import WiFiTab from './WiFi'
import BLETab from './BLE'
import { SensorTab } from './Sensor'

interface SettingFieldInterface{
  render(id: number, prop: {}): void
}

const wifiTab = new WiFiTab($)
const bleTab = new BLETab($)
// const sensorTab = new SensorTab($)

export default class SettingField implements SettingFieldInterface{
  private $: JQueryStatic
  private TargetId: string 
  SensorTab: SensorTab
  Dashboard: Dashboard

  constructor(id: string, _$: JQueryStatic){
    this.$ = _$
    this.TargetId = id
    this.SensorTab = new SensorTab(this.$)
    this.Dashboard = new Dashboard(this.$)
  }

  render(id: number, prop: {}){
    switch(id){
      case 0: 
        $('#' + this.TargetId).append(this.Dashboard.renderElement({}))
        this.Dashboard.applyStyle()
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
        $('#' + this.TargetId).append(this.SensorTab.renderElement({}))
        this.SensorTab.applyStyle()
        break
      default: break
    }
  }
}