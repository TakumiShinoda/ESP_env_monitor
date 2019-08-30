import React from 'react';
import { render } from 'react-dom';
import $ from 'jquery'
import { Application } from './components/application';

$(document).ready(() => {
  render(
    <Application />,
    document.getElementById("contents")
  )
})