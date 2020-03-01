const noble = require('noble-mac')

const constant = require('./constant.js');

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') noble.startScanning()
  else noble.stopScanning()
});

noble.on('discover', function(peripheral) {
  const adv = peripheral.advertisement

  noble.stopScanning()
  if(adv.localName == constant.DeviceName){
    const manu = adv.manufacturerData
    const hour = parseInt(manu[0])
    const min = parseInt(manu[1])
    const sec = parseInt(manu[2])
    const tempRaw = parseFloat(manu[3]) + (parseFloat(manu[4]) / 100.0)
    const tempCPU = parseFloat(manu[5]) + (parseFloat(manu[6]) / 100.0)
    const humid = parseFloat(manu[7]) + (parseFloat(manu[8]) / 100.0)
    const pressureInt = (parseFloat(manu[9]) * 0x10000) + (parseFloat(manu[10]) * 0x100) + parseFloat(manu[11])
    const pressureDecimal = parseFloat(manu[12])
    const pressure = pressureInt + (pressureDecimal / 100.0)
    const historyAmount = (parseFloat(manu[17]) * 0x100) + parseFloat(manu[18])

    const resultJsonString = `{
      "sensorInfos": {
        "temperature": ${tempRaw},
        "cpuTemperature": ${tempCPU},
        "humidity": ${humid},
        "pressure": ${pressure},
        "moment": {
          "hour": ${hour},
          "min": ${min},
          "sec": ${sec}
        }
      },
      "status": {
        historyAmount: ${historyAmount}
      }
    }`

    console.log(manu[17])
    console.log(resultJsonString)
    process.exit(0);
  }

  noble.startScanning()
})