import React, { Component, ReactNode, CSSProperties } from "react";
import { ContentSelector } from "./contentSelector";
import { ContentArea } from "./contentArea";
import { Dashboard } from "./dashBoard";
import { ContentBase } from "./contentBase";
import { ipcRenderer } from "electron";
import { SensorInfos } from "../../sensorInfo";

interface ApplicationProps{}
interface ApplicationStates{
  contentIndex: number
}

export class Application extends Component<ApplicationProps, ApplicationStates>{
  constructor(props: ApplicationProps){
    super(props)
    this.state = {
      contentIndex: 0
    }

    this.contents = [
      <ContentBase content={<Dashboard parent={this} />}/>,
      <ContentBase content={<div/>}/>,
      <ContentBase content={<div/>}/>,
      <ContentBase content={<div/>}/>
    ]
  }

  public static menues: string[] = ['DashBoard', 'WiFi', 'BLE', 'Sensor']
  public static style: CSSProperties = {
    paddingTop: '0.5%',
    height: '99%'
  }

  public lastSensorValue: SensorInfos = {
    adjTemp: 0,
    adjTempAve: 0,
    cpuTemp: 0,
    humidity: 0,
    moment: '',
    pressure: 0,
    rawTemp: 0,
    rawTempAve: 0
  }

  private contents: ReactNode[] = []

  public render(): ReactNode{
    return (
      <div style={Application.style}>
        <ContentSelector parent={this} />
        <ContentArea contents={this.contents} contentIndex={this.state.contentIndex} />
      </div>
    )
  }
}