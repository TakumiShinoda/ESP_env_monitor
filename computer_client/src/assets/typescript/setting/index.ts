import $ = require('jquery')
import Menubar from './components/Menubar/main'
import SettingField from './components/SettingField/main'

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
  openSetting(1)
})