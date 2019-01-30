import Utils from '../../../Utils'
import FieldInterface from './FieldInterface'

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
    '#overviewListLastUpdate': {
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
    let list: string[] = ['Temperature', 'Humidity', 'Pressure']

    for(var i = 0; i < list.length; i++){
      ul.append($('<li>').append(list[i] + ': false'))
    }
    ul.append($('<li id=overviewListLastUpdate>').append('LastUpdate: 2019/1/30/16:19:25'))
    return Utils.convertToHTML(ul)
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