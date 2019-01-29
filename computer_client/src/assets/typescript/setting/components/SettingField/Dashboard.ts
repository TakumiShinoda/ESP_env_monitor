import Utils from '../../../Utils'
import FieldInterface from './FieldInterface'

const Styles: any = {
  'default': {
    '#dashboardField': {
      'margin': '0 10%'
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
      'list-style': 'none'
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
    let list: string[] = ['WiFi', 'BLE']

    for(var i = 0; i < list.length; i++){
      ul.append($('<li>').append(list[i] + ': false'))
    }
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
      </div>
    `
  }
}