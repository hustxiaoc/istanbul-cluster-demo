'use strict';

const path = require('path');
const childProcess = require('child_process');

let rid = 0;
const service = {};
const requestQueue = new Map();

module.exports = function (ready) {
  const worker = childProcess.fork(path.join(__dirname,'./worker'));

  function send() {
    rid++;
    let args = [].slice.call(arguments);
    const method = args.slice(0,1)[0];
    const callback = args.slice(-1)[0];

    const req = {
      rid: rid,
      method:method,
      args:args.slice(1,-1)
    };

    requestQueue.set(rid,Object.assign({
      callback: callback
    }, req));

    worker.send(req);
  }

  worker.on('message', function(message){
    if (message.action === 'register') {
       message.methods.forEach((method) => {
        service[method] = send.bind(null, method);
       });
       ready(service);
    } else {
      const req = requestQueue.get(message.rid);
      const callback = req.callback;
      if (message.success) {
        callback(null, message.data);
      } else {
        callback(new Error(message.error));
      }
      requestQueue.delete(message.rid);
    }
  });
}