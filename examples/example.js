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

	if (data.pin === 8) {
		cluster.setPin(1, !cluster.getPinValue(1));
	} else if(data.pin === 12){
    cluster.setPin(1, !cluster.getPinValue(1));
  }
});


process.on('SIGINT', function(){
	console.log('SIGINT');
  cluster.removeAllListeners();
  cluster.disableInterrupt();
});
