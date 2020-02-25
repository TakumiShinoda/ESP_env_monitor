const utils = require('./utils')

module.exports.connect = (peripheral) => {
  return new Promise((res, rej) => {
    utils.timeout(5000, (timer_res, timer_rej, timer) => {
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

module.exports.disconnect = (peripheral) => { 
  return new Promise((res, rej) => {
    peripheral.disconnect((err) => {
      if(err) rej(err);
      else res();
    });
  });
}

module.exports.findService = (peripheral, uuids) => {
  return new Promise((res, rej) => {
    utils.timeout(5000, (timer_res, timer_rej, timer) => {
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

module.exports.findCharacteristic = (services, uuids) => {
  return new Promise((res, rej) => {
    utils.timeout(5000, (timer_res, timer_rej, timer) => {
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

module.exports.sendTX = (chara, buf) => {
  return new Promise((res, rej) => {
    if(!Buffer.isBuffer(buf)) rej('Second arg isn\'t Buffer');
    chara.write(buf, false, (err) => {
      if(err) rej();
      else res();
    });
  })
}

module.exports.recvRX = (chara) => {
  return new Promise((res, rej) => {
    chara.read((err, data) => {
      res(data);
    });
  });
}