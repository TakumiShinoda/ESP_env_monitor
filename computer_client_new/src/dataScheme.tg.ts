import { SensorInfos, MomentObj } from './dataScheme'
import Moment from 'moment';

export const defSensorInfos: SensorInfos = {
  temperature: 0,
  cpuTemperature: 0,
  humidity: 0,
  pressure: 0,
  moment: Moment()
}

export function isMomentObj(arg: any): arg is MomentObj{
  return (
    typeof(arg.hour) == 'number' && 
    typeof(arg.min) == 'number' &&
    typeof(arg.sec) == 'number'
  )
}

export function isSensorInfos(arg: any): arg is SensorInfos {
  return (
    typeof(arg.temperature) == 'number' && 
    typeof(arg.humidity) == 'number' &&
    typeof(arg.pressure) == 'number' &&
    typeof(arg.cpuTemperature) == 'number' &&
    (
      arg.moment instanceof Moment ||
      isMomentObj(arg.moment)
    ) 
  )
}