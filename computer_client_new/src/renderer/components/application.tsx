import React, { Component, ReactNode, CSSProperties } from "react";
import { ContentSelector } from "./contentSelector";
import { ContentArea } from "./contentArea";
import { Dashboard } from "./dashBoard";
import { ContentBase } from "./contentBase";
import { SensorInfos } from "../../dataScheme";
import { defSensorInfos } from "../../dataScheme.tg"

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

  public lastSensorValue: SensorInfos = defSensorInfos

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