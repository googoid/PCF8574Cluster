const PCF8574Cluster = require('../');
const i2cBus = require('i2c-bus').openSync(1);

const addresses = [0x20, 0x22];
const initialStates = [true, true];

const cluster = new PCF8574Cluster(i2cBus, addresses, initialStates);

cluster.setAllPins(true)
.then(() => {
  setTimeout(() => {}, 2000);
})
.then(() => {
  return cluster.setAllPins(false);
});


process.on('SIGINT', function(){
  console.log('SIGINT');
  cluster.removeAllListeners();
  cluster.disableInterrupt();
});
