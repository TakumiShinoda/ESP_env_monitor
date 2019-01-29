import $ = require('jquery')
import Menubar from './components/Menubar/main'

import '../../css/setting/styles.css'

let menubar = new Menubar('menubarArea', $)

$(document).ready(() => {
  menubar.render()
})