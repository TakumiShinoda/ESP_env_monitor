import React, { Component, ReactNode } from "react";
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
  private contents: ReactNode[] = []
  public lastSensorValue: {temperature: number, humidity: number, pressure: number} = {
    temperature: 0, 
    humidity: 0, 
    pressure: 0
  }

  public render(): ReactNode{
    return (
      <div>
        <ContentSelector parent={this} />
        <ContentArea contents={this.contents} contentIndex={this.state.contentIndex} />
      </div>
    )
  }
}