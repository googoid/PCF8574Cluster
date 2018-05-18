const PCF8574Cluster = require('../');
const i2cBus = require('i2c-bus').openSync(1);

const addresses = [0x20, 0x22];
const initialStates = [true, true];

const cluster = new PCF8574Cluster(i2cBus, addresses, initialStates);

cluster.enableInterrupt(1, 4);
cluster.enableInterrupt(2, 5);

cluster.outputPin(1, true, false)
.then(() => {
  return cluster.outputPin(2, true, false);
})
.then(() => {
  return cluster.inputPin(8, false);
})
.then(() => {
  return cluster.inputPin(12, false);
});


cluster.on('input', (data) => {
  console.log('input', data);

  if ([8, 12].indexOf(data.pin) > -1) {
    cluster.setPin(1, !cluster.getPinValue(1));
  }
});


process.on('SIGINT', function(){
  console.log('SIGINT');
  console.log('listeners before remove', cluster.listeners('input'));
  console.log('pcf listeners before remove', cluster._pcf_instances[0].listeners('input'));

  cluster.removeAllListeners();
  cluster.disableAllInterrupts();

  console.log('listeners after remove', cluster.listeners('input'));
  console.log('pcf listeners after remove', cluster._pcf_instances[0].listeners('input'));
});
