import Utils from '../../../Utils'
import FieldInterface from './FieldInterface'
import { SensorObj } from './Sensor'

const Styles: any = {
  'default': {
    '#dashboardField': {
      'margin': '0 10%',
      'padding-top': '10px'
    },
    '#statusField': {
      'border': 'solid 1px',
      'border-radius': '8px',
      'width': '95%',
      'margin': 'auto',
      'padding': '0',
    },
    '#statusList': {
      'font-size': '20px',
      'padding': '0 8px',
      'list-style': 'none',
    },
    '#overviewField': {
      'border': 'solid 1px',
      'border-radius': '8px',
      'width': '95%',
      'margin': 'auto',
      'padding': '0',
    },
    '#overviewList': {
      'font-size': '20px',
      'padding': '0 8px',
      'list-style': 'none',
      'margin-bottom': '0',
    },
    '#lastUpdateOverview': {
      'font-size': '12px',
      'text-align': 'right',
      'margin-top': '10px',
    }
  }
}

export default class Dashboard implements FieldInterface{
  private $: JQueryStatic
  private TargetId: string

  constructor(_$: JQueryStatic, targetId: string = ''){
    this.$ = _$
    this.TargetId = targetId
  }

  static OverviewList = ['Temperature', 'Humidity', 'Pressure']
  static OverviewListUnits = ['°C', '%', 'hPa']

  private statusList(): string{
    let ul: JQuery<HTMLElement> = $('<ul id=statusList>')
    let list: string[] = ['WiFi Power On', 'LAN Connection', 'BLE Connection']

    for(var i = 0; i < list.length; i++){
      ul.append($('<li>').append(list[i] + ': false'))
    }
    return Utils.convertToHTML(ul)
  }

  private overviewList(): string{
    let ul: JQuery<HTMLElement> = $('<ul id=overviewList>')

    for(var i = 0; i < Dashboard.OverviewList.length; i++){
      ul.append($(`<li id="${Dashboard.OverviewList[i]}Overview">`).append(Dashboard.OverviewList[i] + ': NoData'))
    }
    ul.append($('<li id=lastUpdateOverview>').append('LastUpdate: xxxx/xx/xx/xx:xx:xx'))
    return Utils.convertToHTML(ul)
  }

  updateOverviewList(sensorObj​​: SensorObj){
    let pressure: number = parseInt(sensorObj.pressure) / 100
    let args: string[] = [sensorObj.adjTempAve, sensorObj.humidity, pressure.toString(), sensorObj.moment]

    for(var o in Dashboard.OverviewList) $(`#${Dashboard.OverviewList[o]}Overview`).text(`${Dashboard.OverviewList[o]}: ${args[o]}${Dashboard.OverviewListUnits[o]}`)
    $('#lastUpdateOverview').text(`Last Update: ${args[args.length - 1].replace(/-/g, '/')}`)
  }

  applyStyle(){
    Object.keys(Styles.default).forEach((key: string) => {
      this.$(key).css(Styles.default[key])
    })
  }

  renderElement(prop: {}){
    return `
      <div id=dashboardField>
        <h2>Status</h2>
        <div id=statusField>
          ${this.statusList()}
        </div>
        <h2 style="margin-top: 25px;">Overview</h2>
        <div id=overviewField>
          ${this.overviewList()}
        </di>
      </div>
    `
  }
}