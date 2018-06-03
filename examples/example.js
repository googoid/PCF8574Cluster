// Require the pcf8574cluster module
const PCF8574Cluster = require('../');

// Require the i2c-bus module and open the bus
const i2cBus = require('i2c-bus').openSync(1);

// Define the addresses of the PCF8574/PCF8574A
const addresses = [0x20, 0x21];

// Define the initialStates of the PCF8574/PCF8574A
const initialStates = [true, true];

// Init a new PCF8574Cluster with all pins high by default
const cluster = new PCF8574Cluster(i2cBus, addresses, initialStates);

// Enable interrupt detection for first expander on BCM pin 24 (which is GPIO.5)
cluster.enableInterrupt(1, 24);

// Enable interrupt detection for second expander on BCM pin 25 (which is GPIO.6)
cluster.enableInterrupt(2, 25);

// Then define pin 1 as inverted output with initally false
cluster.outputPin(1, true, false)
.then(() => {
  // Then define pin 2 as inverted output with initally false
  return cluster.outputPin(2, true, false);
})
.then(() => {
  // Then define pin 10 as non inverted input
  return cluster.inputPin(10, false);
});


// Add an event listener on the 'input' event
cluster.on('input', (data) => {
  if ([10, 12].indexOf(data.pin) > -1) {
    // Toggle pin 1
    cluster.setPin(1, !cluster.getPinValue(1));
  }
});

// Handler for clean up on SIGINT (ctrl+c)
process.on('SIGINT', function(){
  cluster.removeAllListeners();
  cluster.disableAllInterrupts();
});
