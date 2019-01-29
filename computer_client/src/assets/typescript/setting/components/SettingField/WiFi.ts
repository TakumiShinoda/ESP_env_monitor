import FieldInterface from './FieldInterface'
import Utils from '../../../Utils'

export default class WiFi implements FieldInterface{
  $: JQueryStatic
  TargetId: string

  constructor(_$: JQueryStatic, targetId: string = ''){
    this.$ = _$
    this.TargetId = targetId
  }

  applyStyle(){
  }

  renderElement(prop: {}){
    return `
      <p>WiFi</p>
    `
  }
}