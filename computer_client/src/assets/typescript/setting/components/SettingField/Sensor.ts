import FieldInterface from './FieldInterface'
import Utils from '../../../Utils'

export interface SensorObj{
  rawTemp: string
  rawTempAve: string
  adjTemp: string
  adjTempAve: string
  cpuTemp: string
  humidity: string
  pressure: string
  moment: any
}

const Styles: any = {
  'default': {
    'hr': {
      'margin': '5px 0'
    },
    '#sensorField': {
      'width': '80%',
      'margin': 'auto',
      'margin-top': '10px'
    },
    '#sensorInfosField': {
      'border': 'solid 1px black',
      'border-radius': '8px',
      'padding': '5px' 
    },
  }
}

export class SensorTab implements FieldInterface{
  $: JQueryStatic
  TargetId: string

  constructor(_$: JQueryStatic, targetId: string = ''){
    this.$ = _$
    this.TargetId = targetId
  }

  applyStyle(){
    Object.keys(Styles.default).forEach((key: string) => {
      this.$(key).css(Styles.default[key])
    })
  }

  reloadSensorInfo(sensorObj: SensorObj){
    this.$('#rawTempArea').text(`Raw Temp: ${sensorObj.rawTemp}`)
    this.$('#rawTempAveArea').text(`Raw Temp Ave: ${sensorObj.rawTempAve}`)
    this.$('#adjTempArea').text(`Adj Temp Ave: ${sensorObj.adjTemp}`)
    this.$('#adjTempAveArea').text(`Adj Temp Ave: ${sensorObj.adjTempAve}`)
    this.$('#cpuTemp').text(`CPU Temp: ${sensorObj.cpuTemp}`)
    this.$('#humidityArea').text(`Humidity: ${sensorObj.humidity}`)
    this.$('#pressureArea').text(`Pressure: ${sensorObj.pressure}`)
    this.$('#updateTime').text(sensorObj​​.moment)
  }

  renderElement(prop: {}){
    return `
      <div id="sensorField">
        <h4>Sensor Infomation</h4>
        <hr>
        <div id="sensorInfosField">
          <div id="rawTempArea">No Data</div>
          <div id="rawTempAveArea">No Data</div>
          <div id="adjTempArea">No Data</div>
          <div id="adjTempAveArea">No Data</div>
          <div id="cpuTemp">No Data</div>
          <div id="humidityArea">No Data</div>
          <div id="pressureArea">No Data</div>
          <div id="updateTime">No Update</div>
        </div>
      </div>
    `
  }
}