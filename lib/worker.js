'use strict';

const service = {
  add() {
    const args = [].slice.call(arguments);
    return args.slice().reduce(function(a,b) {
      return a+b;
    });
  },

  time() {
    const args = [].slice.call(arguments);
    return new Promise((resolve, reject)=> {
       setTimeout( ()=> {
          const ret = args.slice().reduce(function(a,b) {
                        return a*b;
                      });
          resolve(ret);
       }, 1000);
    });
  }
}

process.send && process.send({
  action:'register',
  methods: Object.keys(service)
});

process.on('message', function(message) {
  let ret = { success: false, rid: message.rid };
  const method = message.method;
  if (service[method]) {
    try {
      const result = service[method].apply(service, message.args);
      ret.success = true;
      if(result.then) {
        return result.then((data)=> {
          ret.data = data;
          process.send(ret);
        }).catch((err)=>{
          ret.success = false;
          ret.error = err.message;
          process.send(err);
        })
      }
      ret.data = result;
    } catch (err) {
      console.log(err);
      ret.error = err.message;
    }
  }
  process.send(ret);
});