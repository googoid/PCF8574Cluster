# pcf8574cluster

BASED ON [pcf8574](https://www.npmjs.com/package/pcf8574).

Also You can use [node-red-contrib-pcf8574-cluster](https://www.npmjs.com/package/node-red-contrib-pcf8574-cluster) for Node-RED.

Control each pin of a PCF8574/PCF8574A/PCF8574P I2C port expander IC.

The PCF8574/PCF8574A is an 8 bit/pin port expander IC, which can be controlled over the I2C-Bus.
Each of the 8 pins can be separately used as an input or output.
It also offers an interrupt signal, which can be used to detect input changes by the I2C master (e.g. a Raspberry Pi).
For more information about the PCF8574/PCF8574A please consult the [datasheet from Texas Instruments](http://www.ti.com/lit/ds/symlink/pcf8574.pdf).

## Installation

```
npm install pcf8574cluster
```
You should be able to use this module on any Linux based OS.

To use the interrupt detection you need a Raspberry Pi or a similar board.

## Examples

Note that you need to construct the [i2c-bus](https://npmjs.org/package/i2c-bus) object
and pass it in to the module along with the I2C addresses of the PCF8574/PCF8574A.

The example blow can be found in the [examples directory](https://github.com/david-kasparov/PCF8574Cluster/tree/master/examples) of this package.

```js
// Require the pcf8574cluster module
const PCF8574Cluster = require('pcf8574cluster');

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
```


## API

The API uses __Events__ for detected input changes and __Promises__ for all asyncronous actions.

Input changes can be detected in two ways:
* Using a GPIO to observe the interrupt signal from the PCF8574/PCF8574A IC. *Recommended on Raspberry Pi or similar.*
* Call `doPoll()` manually frequently enough to actively read the current states. This leads to a higher load on the I2C-Bus.

If a pin is defined as an input and a changed state is detected, an `input` Event will be emitted with an object containing the `pin` number and the new `value` of this pin.

You can set an inverted flag for each pin separately, which will result in an inverted input or output.
If an inverted input has a low level it will be interpreted as true and a high level will be false.
An inverted output will write a low level if you set it to true and write a high level if false.


### new PCF8574(i2cBus, address, initialState)
```js
constructor(i2cBus:I2cBus, addresses:array, initialState:array);
```
Constructor for a new PCF8574/PCF8574A cluster instance.

* `i2cBus` - Instance of an opened i2c-bus.
* `addresses` - The addresses of the PCF8574/PCF8574A IC.
* `initialStates` - The initial states of the pins of this IC. You can set a bitmask (e.g. *0b00101010*) to define each pin seprately, or use true/false for all pins at once.

Note that you need to construct the [i2c-bus](https://npmjs.org/package/i2c-bus) object and pass it in to the module.

If you use this IC with one or more input pins, you have to call
* `enableInterrupt(gpioPin)` to detect interrupts from the IC using a GPIO pin, or
* `doPoll()` frequently enough to detect input changes with manually polling.

### enableInterrupt(index, gpioPin)
```js
enableInterrupt(index:number, gpioPin:number):void;
```
Enable the interrupt detection on the specified GPIO pin.
You can use one GPIO pin for multiple instances of the PCF8574 class.

* `index` - PCF8574/8574A index number from 1 - 8.
* `gpioPin` - BCM number of the pin, which will be used for the interrupts from the PCF8574/8574A IC.


### disableInterrupt(index)
```js
disableInterrupt(index:number):void;
```
Disable the interrupt detection for exact expander.
This will unexport the interrupt GPIO, if it is not used by an other instance of this class.

* `index` - PCF8574/8574A index number from 1 - 8.

### disableAllInterrupts()
```js
disableAllInterrupts():void;
```
Disable the interrupt detection for all expanders in cluster.

### doPoll()
```js
doPoll():Promise<{}>;
```
Manually poll changed inputs from the PCF8574/PCF8574A IC.

If a change on an input is detected, an `input` Event will be emitted with a data object containing the `pin` and the new `value`.
This have to be called frequently enough if you don't use a GPIO for interrupt detection.
If you poll again before the last poll was completed, the promise will be rejected with an error.


### outputPin(pin, inverted, initialValue)
```js
outputPin(pin:PCF8574.PinNumber, inverted:boolean, initialValue?:boolean):Promise<{}>;
```
Define a pin as an output.
This marks the pin to be used as an output pin.
Returns a Promise which will be resolved when the pin is ready.

* `pin` - The pin number. (1 to 64)
* `inverted` - true if this pin should be handled inverted (true=low, false=high)
* `initialValue` - (optional) The initial value of this pin, which will be set immediatly.


### inputPin(pin, inverted)
```js
inputPin(pin:PCF8574.PinNumber, inverted:boolean):Promise<{}>;
```
Define a pin as an input.
This marks the pin for input processing and activates the high level on this pin.
Returns a Promise which will be resolved when the pin is ready.

* `pin` - The pin number. (1 to 64)
* `inverted` - true if this pin should be handled inverted (high=false, low=true)

Note that an input is always set to high (pullup) internally.


### setPin(pin, value)
```js
setPin(pin:PCF8574.PinNumber, value?:boolean):Promise<{}>;
```
Set the value of an output pin.
If no value is given, the pin will be toggled.
Returns a Promise which will be resolved when the new value is written to the IC.

* `pin` - The pin number. (1 to 64)
* `value` - The new value for this pin.


### setAllPins(value)
```js
setAllPins(value:boolean):Promise<{}>;
```
Set the given value to all output pins.
Returns a Promise which will be resolved when the new values are written to the IC.

* `value` - The new value for this pin.


### getPinValue(pin)
```js
getPinValue(pin:PCF8574.PinNumber):boolean;
```
Returns the current value of a pin.
This returns the last saved value, not the value currently returned by the PCF8574/PCF9574A IC.
To get the current value call doPoll() first, if you're not using interrupts.

* `pin` - The pin number. (1 to 64)
