const PCF8574Cluster = require('../');
const i2cBus = require('i2c-bus').openSync(1);

const addresses = [0x20, 0x22];
const initialStates = [true, true];

const cluster = new PCF8574Cluster(i2cBus, addresses, initialStates);

cluster.outputPin(1, true, false)
.then(() => {
  return cluster.outputPin(2, true, false);
})
.then(() => {
  return cluster.setAllPins(true);
})
.then(() => {
  return cluster.getPinValue(1);
})
.then((pinValue) => {
  console.log('pin1 value', pinValue);
})
.delay(2000)
.then(() => {
  return cluster.setAllPins(false);
})
.then(() => {
  return cluster.getPinValue(1);
})
.then((pinValue) => {
  console.log('pin1 value', pinValue);
});


process.on('SIGINT', function(){
  console.log('SIGINT');
  cluster.removeAllListeners();
  cluster.disableAllInterrupts();
});
