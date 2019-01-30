import FieldInterface from './FieldInterface'
import Utils from '../../../Utils'

const Styles: any = {
  'default': {
    '#wifiField': {
      'margin': 'auto',
      'padding-top': '10px',
      'width': '80%',
    },
    'hr': {
      'margin': '5px 0'
    },
    '.form-control': {
      'font-size': '10px'
    },
    '#settingWifiAPConfig': {
      'width': '70%'
    },
    '#wifiForm': {
      'display': 'inline',
    },
    '#APConfigSubmit': {
      'display': 'inline',
    }
  }
}

export default class WiFi implements FieldInterface{
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

  renderElement(prop: {}){
    return `
      <div id=wifiField>
        <h4>AccessPointSetting</h4>
        <hr>
        <div id=settingWifiAPConfig>
          <label>SSID</label>
          <input class=form-control id=ssidForm type=text>
          <label style="margin-top: 5px;">Password</label>
          <div class="form-inline">
            <input class=form-control id=passForm type=password style="width: 70%;">
            <input class="btn btn-primary" id=APConfigSubmit type=button value=Submit style="width: 25%;margin-left: 5%;">
          </div>
        </div>
      </div>
    `
  }
}