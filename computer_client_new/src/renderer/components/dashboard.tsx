import React, { ReactNode, Component, CSSProperties } from "react";
import { StateCard } from "./stateCard";
import Thermometer from "../svg/thermometer.svg"
import Humidity from "../svg/humidity.svg"
import Pressure from "../svg/pressure.svg"
import Cpu from "../svg/computer-cpu.svg"
import { StyleTemplates } from "../styles";
import { ipcRenderer } from "electron";
import { SensorInfos } from "../../sensorInfo";
import { Application } from "./application";

interface DashboardProps{
  parent: Application
}
interface DashboardStates{
  sensorInfo: SensorInfos
}

export class Dashboard extends Component<DashboardProps, DashboardStates>{
  constructor(props: DashboardProps){
    super(props)

    const _this: Dashboard = this
    this.state = {
      sensorInfo: this.props.parent.lastSensorValue
    }

    ipcRenderer.on('updateSensorInfos', (ev: Electron.IpcRendererEvent, data: {data: {sensorInfos: SensorInfos}}) => {
      _this.props.parent.lastSensorValue = data.data.sensorInfos
      _this.setState({ sensorInfo: data.data.sensorInfos })
    }) 
  }

  private static style: CSSProperties = {
    width: '96%',
    height: '95%',
    paddingLeft: '2%',
    paddingTop: '2%'
  }

  private static stateCardGap: CSSProperties = {
    width: '1%'
  }

  public render(): ReactNode{
    let dashboardStyle: CSSProperties = Object.assign({}, Dashboard.style, StyleTemplates.flex)

    return (
      <div className="dashboard" style={dashboardStyle}>
        <StateCard icon={<Thermometer width="60px" height="50px"/>} title="Temperature" value={this.state.sensorInfo.rawTemp}/>
        <span style={Dashboard.stateCardGap} />
        <StateCard icon={<Humidity width="60px" height="50px"/>} title="Humidity" value={this.state.sensorInfo.humidity}/>
        <span style={Dashboard.stateCardGap} />
        <StateCard icon={<Pressure width="60px" height="50px"/>} title="Pressure" value={parseFloat((this.state.sensorInfo.pressure / 100).toFixed(2))}/>
        <span style={Dashboard.stateCardGap} />
        <StateCard icon={<Cpu width="60px" height="50px"/>} title="CPU Temperature" value={this.state.sensorInfo.cpuTemp} />
      </div>
    )
  }
}