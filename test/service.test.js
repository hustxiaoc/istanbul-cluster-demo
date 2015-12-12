'use strict';
const childProcess = require('child_process');
const master = require('../lib/master');
const assert = require('assert');
const fork = childProcess.fork;
const path = require('path');

childProcess.fork = function(modulePath, args, options) {

  options = options || {};
  const execPath = path.resolve(__dirname,'../node_modules/.bin/istanbul');

  args = [
        'cover', '--report', 'none', '--print', 'none', '--include-pid',
        modulePath+'.js'];

  return fork.apply(childProcess,[execPath, args, options]);
}

describe('test/app.test.js', function() {
  let service;
  before(function(done) {
    master(function(_service){
      service = _service;
      done();
    });
  });

  it('add should work', function(done) {
    service.add(1,2,3,4,5, function(err, result) {
        assert(result === 1+2+3+4+5);
        done();
    });
  });

  it('time should work', function(done) {
    service.time(1,2,3,4,5, function(err, result) {
        assert(result === 1*2*3*4*5);
        done();
    });
  });
});

