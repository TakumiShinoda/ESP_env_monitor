const noble = require('noble-mac');

const ble = require('./ble');
const Constant = require('./constant')
const devPrint = require('./utils').devPrint

devPrint.isDebug = false

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    devPrint.print('Power on.');
    noble.startScanning();
  } else {
    devPrint.print('Failed');
    noble.stopScanning();
  }
});

noble.on('discover', async (peripheral) => {
  let deviceName = peripheral.advertisement.localName;

  devPrint.print(deviceName)
  noble.stopScanning()
  
  if(deviceName != Constant.DeviceName){
    noble.startScanning()
    return
  }

  try{
    await ble.connect(peripheral) 
    devPrint.print('Connected')

    let services = await ble.findService(peripheral, Constant.ServiceUUIDs)
    let service = null
    for(var i = 0; i < services.length; i++) if(services[i].uuid == Constant.ServiceUUIDs[0].replace(/-/g, '')) service = services[i];
    devPrint.print('Got service')

    let charas = await ble.findCharacteristic(service, Constant.CharacteristicUUIDs)
    let chara = null
    for(var i = 0; i < charas.length; i++) if(charas[i].uuid == Constant.CharacteristicUUIDs[0].replace(/-/g, '')) chara = charas[i];
    devPrint.print('Got characteristic')

    let recvResult = await ble.recvRX(chara)
    devPrint.print('Success recvRX')

    await ble.disconnect(peripheral)
    devPrint.print('Disconnected')

    let recvResultStr = recvResult.toString()
    let resultSplit = recvResultStr.split(',');
    let resultJsonString = `{
      "sensorInfos": {
        "rawTemp": ${resultSplit[0]},
        "rawTempAve": ${resultSplit[1]},
        "adjTemp": ${resultSplit[2]},
        "adjTempAve": ${resultSplit[3]},
        "cpuTemp": ${resultSplit[4]},
        "humidity": ${resultSplit[5]},
        "pressure": ${resultSplit[6]}
      },
      "wifiInfos": {
      }
    }`

    if(JSON.parse(resultJsonString)) console.log(resultJsonString)
    process.exit(0);
  }catch(err){
    console.error(err)
    process.exit(1);
  }
});