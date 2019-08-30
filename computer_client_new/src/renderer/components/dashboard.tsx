import React, { ReactNode, Component, CSSProperties } from "react";
import { StateCard } from "./stateCard";
import Thermometer from "../svg/thermometer.svg"
import Humidity from "../svg/humidity.svg"
import Pressure from "../svg/pressure.svg"
import { StyleTemplates } from "../styles";
import { ipcRenderer } from "electron";
import { SensorInfos } from "../../sensorInfo";

interface DashboardProps{}
interface DashboardStates{
  temperature?: number
  humidity?: number
  pressure?: number
}

export class Dashboard extends Component<DashboardProps, DashboardStates>{
  constructor(props: DashboardProps){
    super(props)
    this.state = {
      temperature: undefined,
      humidity: undefined,
      pressure: undefined
    }

    const component: Dashboard = this

    ipcRenderer.on('updateSensorInfos', (ev: Electron.IpcRendererEvent, data: {data: {sensorInfos: SensorInfos}}) => {
      component.setState({
        temperature: data.data.sensorInfos.adjTempAve,
        humidity: data.data.sensorInfos.humidity,
        pressure: parseFloat((data.data.sensorInfos.pressure / 100).toFixed(2))
      })
    }) 
  }

  private static style: CSSProperties = {
    padding: '20px',
    width: '100%',
    height: '100%'
  }

  public render(): ReactNode{
    let dashboardStyle: CSSProperties = Object.assign({}, Dashboard.style, StyleTemplates.flex)

    return (
      <div style={dashboardStyle}>
        <StateCard icon={<Thermometer width="50px" height="50px"/>} title="Temperature" value={this.state.temperature}/>
        <StateCard icon={<Humidity width="60px" height="50px"/>} title="Humidity" value={this.state.humidity}/>
        <StateCard icon={<Pressure width="60px" height="50px"/>} title="Pressure" value={this.state.pressure}/>
      </div>
    )
  }
}