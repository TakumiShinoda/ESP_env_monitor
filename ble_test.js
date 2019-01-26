const noble = require('noble-mac');

const DeviceName = 'ENV_Monitor_BLE';
const ServiceUUIDs = ["81d78b05-4e0a-4644-b364-b79312e4c307"];
const CharacteristicUUIDs = ["0989bf07-e886-443e-82db-7108726bb650"];

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
    services.discoverCharacteristics(uuids, (err, charas) => {
      if(err) rej(err);
      else if(charas.length <= 0) rej('No Characteristics');
      else res(charas);
    });
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
    console.log('Power on.');
    noble.startScanning();
  } else {
    console.log('Failed');
    noble.stopScanning();
  }
});

noble.on('discover', function(peripheral) {
  let deviceName = peripheral.advertisement.localName;

  console.log(deviceName);
  noble.stopScanning();
  if(deviceName == DeviceName){
    connect(peripheral)
      .then(() => {
        console.log('connected');
        return findService(peripheral, ServiceUUIDs);
      })
      .then((services) => {
        let service = null;

        console.log('get services');
        for(var i = 0; i < services.length; i++) if(services[i].uuid == ServiceUUIDs[0].replace(/-/g, '')) service = services[i];
        return findCharacteristic(service, CharacteristicUUIDs);
      })
      .then((charas) => {
        let chara = null;

        console.log('get charas');
        for(var i = 0; i < charas.length; i++) if(charas[i].uuid == CharacteristicUUIDs[0].replace(/-/g, '')) chara = charas[i];
        return recvRX(chara);
      })
      .then((data) => {
        console.log(data.toString());
        disconnect(peripheral)
          .then(() => {
            console.log('Disconnected')
            process.exit(0);
          })
          .catch(() => { console.log('Failed to disconnect') });
      })
      .catch((err) => {
        console.log('Error: ', err);
        if(err == 'Time out.') process.exit(1);
      	disconnect(peripheral)
          .then(() => {
            console.log('Disconnected');
            noble.startScanning();
          })
          .catch(() => { console.log('Failed to disconnect') });
      });
  }else{
    noble.startScanning();
  }
});