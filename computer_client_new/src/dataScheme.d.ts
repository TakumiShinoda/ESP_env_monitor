import { Moment } from "moment";

export interface MomentObj{
  hour: number
  min: number
  sec: number
}

export interface SensorInfos{
  temperature: number
  cpuTemperature: number
  humidity: number
  pressure: number
  moment: Moment | MomentObj
}