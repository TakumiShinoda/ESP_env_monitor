const noble = require('noble-mac');

const DevMode = false

const DeviceName = 'ESP_env_monitor';
const ServiceUUIDs = ["11111110-535d-450f-badb-10b0e18d608d"];
const CharacteristicUUIDs = ["22222226-d562-48f3-9fbc-d11d605e3258"];

function devPrint(mes){
  if(DevMode) console.log(mes)
}

function timeout(milli, callback){
  return new Promise((res, rej) => {
    let timer = setTimeout(() => {
      rej('Time out.');
    }, milli);
    
    callback(res, rej, timer);
  });
}

function connect(peripheral){
  return new Promise((res, rej) => {
    timeout(5000, (timer_res, timer_rej, timer) => {
      peripheral.connect((err) => {
        clearTimeout(timer);
        if(err) timer_rej(err);
        else timer_res();
      });
    })
    .then(() => {
      res();
    })
    .catch((err) => {
      rej(err);
    })
  });
}

function disconnect(peripheral){
  return new Promise((res, rej) => {
    peripheral.disconnect((err) => {
      if(err) rej(err);
      else res();
    });
  });
}

function findService(peripheral, uuids){
  return new Promise((res, rej) => {
    timeout(5000, (timer_res, timer_rej, timer) => {
      peripheral.discoverServices(uuids, (err, services) => {
        clearTimeout(timer);
        if(err) timer_rej(err);
        else if(services.length <= 0) timer_rej('No Services');
        else timer_res(services);
      });
    })
    .then((services) => {
      res(services);
    })
    .catch((err) => {
      rej(err);
    });
  });
}

function findCharacteristic(services, uuids){
  return new Promise((res, rej) => {
    timeout(5000, (timer_res, timer_rej, timer) => {
      clearTimeout(timer);
      services.discoverCharacteristics(uuids, (err, charas) => {
        if(err) timer_rej(err);
        else if(charas.length <= 0) timer_rej('No Characteristics');
        else timer_res(charas);
      });
    })
    .then((charas) => { res(charas) })
    .catch((err) => { rej(err) });
  });
}

function sendTX(chara, buf){
  return new Promise((res, rej) => {
    if(!Buffer.isBuffer(buf)) rej('Second arg isn\'t Buffer');
    chara.write(buf, false, (err) => {
      if(err) rej();
      else res();
    });
  })
}

function recvRX(chara){
  return new Promise((res, rej) => {
    chara.read((err, data) => {
      res(data);
    });
  });
}

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    devPrint('Power on.');
    noble.startScanning();
  } else {
    devPrint('Failed');
    noble.stopScanning();
  }
});

noble.on('discover', async (peripheral) => {
  let deviceName = peripheral.advertisement.localName;

  devPrint(deviceName)
  noble.stopScanning()
  
  if(deviceName != DeviceName){
    noble.startScanning()
    return
  }

  try{
    await connect(peripheral) 
    devPrint('Connected')

    let services = await findService(peripheral, ServiceUUIDs)
    let service = null
    for(var i = 0; i < services.length; i++) if(services[i].uuid == ServiceUUIDs[0].replace(/-/g, '')) service = services[i];
    devPrint('Got service')

    let charas = await findCharacteristic(service, CharacteristicUUIDs)
    let chara = null
    for(var i = 0; i < charas.length; i++) if(charas[i].uuid == CharacteristicUUIDs[0].replace(/-/g, '')) chara = charas[i];
    devPrint('Got characteristic')

    let recvResult = await recvRX(chara)
    devPrint('Success recvRX')

    await disconnect(peripheral)
    devPrint('Disconnected')

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