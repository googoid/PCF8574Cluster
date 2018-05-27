const PCF8574Cluster = require('../');
const i2cBus = require('i2c-bus').openSync(1);

const addresses = [32, 38];
const initialStates = [true, true];

const cluster = new PCF8574Cluster(i2cBus, addresses, initialStates);

cluster.enableInterrupt(1, 24);
cluster.enableInterrupt(2, 25);

cluster.outputPin(1, true, false)
.then(() => {
  return cluster.outputPin(2, true, false);
})
.then(() => {
  return cluster.inputPin(10, false);
});


cluster.on('input', (data) => {
  console.log('input', data);

  console.log(cluster.getPinValue(1), 'before')

  if ([10, 12].indexOf(data.pin) > -1) {
    cluster.setPin(1, !cluster.getPinValue(1));
  }

  console.log(cluster.getPinValue(1), 'after')
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
