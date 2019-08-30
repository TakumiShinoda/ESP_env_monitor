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
  }

  public static menues: string[] = ['DashBoard', 'WiFi', 'BLE', 'Sensor']

  public static contents: ReactNode[] = [
    <ContentBase content={<Dashboard/>}/>,
    <ContentBase content={<div/>}/>,
    <ContentBase content={<div/>}/>,
    <ContentBase content={<div/>}/>
  ]

  public render(): ReactNode{
    return (
      <div>
        <ContentSelector parent={this} />
        <ContentArea contents={Application.contents} contentIndex={this.state.contentIndex} />
      </div>
    )
  }
}