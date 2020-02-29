import React, { ReactNode, Component, CSSProperties } from "react";
import Moment from 'moment'
import { StateCard } from "./stateCard";
import Thermometer from "../svg/thermometer.svg"
import Humidity from "../svg/humidity.svg"
import Pressure from "../svg/pressure.svg"
import Cpu from "../svg/computer-cpu.svg"
import { StyleTemplates } from "../styles";
import { ipcRenderer } from "electron";
import { SensorInfos } from "../../dataScheme";
import { Application } from "./application";
import { isMomentObj } from "../../dataScheme.tg";

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
      let hoge;
      if(isMomentObj(data.data.sensorInfos.moment)){
        hoge = Moment()
          .hour(data.data.sensorInfos.moment.hour) 
          .minute(data.data.sensorInfos.moment.min)
          .second(data.data.sensorInfos.moment.sec)
        data.data.sensorInfos.moment = hoge
      }
      _this.props.parent.lastSensorValue = data.data.sensorInfos
      _this.setState({ sensorInfo: data.data.sensorInfos })
    })
  }

  private static style: CSSProperties = {
    width: '96%',
    height: '91%',
    paddingLeft: '2%',
    paddingTop: '2%'
  }

  private static styleSensorInfoArea: CSSProperties = Object.assign(
    {},
    StyleTemplates.flex,
    StyleTemplates.nospan,
    {
      width: '100%',
      height: '16%',
    }
  )

  private static styleDetailArea: CSSProperties = Object.assign(
    {}, 
    StyleTemplates.textColor.white, 
    StyleTemplates.nospan,
    {
      width: '95%',
      height: '66%',
      marginTop: '5%',
      paddingLeft: '5%'
    }
  )

  private static styleFooter: CSSProperties = Object.assign(
    {}, 
    StyleTemplates.textColor.white, 
    StyleTemplates.nospan,
    {
      width: '100%',
      height: '10%',
    }
  )

  private static stateCardGap: CSSProperties = {
    width: '1%'
  }

  public render(): ReactNode{
    return (
      <div className="dashboard" style={Dashboard.style}>
        <div style={Dashboard.styleSensorInfoArea}>
          <StateCard icon={<Thermometer width="60px" height="50px"/>} title="Temperature" value={this.state.sensorInfo.temperature}/>
          <span style={Dashboard.stateCardGap} />
          <StateCard icon={<Humidity width="60px" height="50px"/>} title="Humidity" value={this.state.sensorInfo.humidity}/>
          <span style={Dashboard.stateCardGap} />
          <StateCard icon={<Pressure width="60px" height="50px"/>} title="Pressure" value={parseFloat((this.state.sensorInfo.pressure / 100).toFixed(2))}/>
          <span style={Dashboard.stateCardGap} />
          <StateCard icon={<Cpu width="60px" height="50px"/>} title="CPU Temperature" value={this.state.sensorInfo.cpuTemperature} />
        </div>
        <div style={Dashboard.styleDetailArea}>
          <u><h2 style={StyleTemplates.nospan}>Details</h2></u>
          <ul>
            <li>RTC: {(this.state.sensorInfo.moment as Moment.Moment).format("YYYY/MM/DD hh:mm:ss")}</li>
            <li>Data Amount: </li>
          </ul>
        </div>
        <div className="footer" style={Dashboard.styleFooter}>
        <div style={{textAlign: 'right'}}>Last Update: {Moment().format('YYYY/MM/DD hh:mm:ss')}</div>
        </div>
      </div>
    )
  }
}