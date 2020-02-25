module.exports.timeout = (milli, callback) => {
  return new Promise((res, rej) => {
    let timer = setTimeout(() => {
      rej('Time out.');
    }, milli);
    
    callback(res, rej, timer);
  });
}