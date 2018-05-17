const EventEmitter = require('events');
const PCF8574 = require('pcf8574').PCF8574;

class PCF8574Cluster extends EventEmitter {
  constructor(i2cBus, addresses, initialStates) {
		super();
    //TODO: params validation

    this._pcf_instances = [];

		this._expander_pins_count = 8;
		this._expanders_count = addresses.length;
		this._total_pins_count =
      this._expander_pins_count * this._expanders_count;

    addresses.forEach((address, i) => {
      let pcf = new PCF8574(i2cBus, address, initialStates[i]);

			pcf.on('input', (data) => {
				data.real_pin = data.pin;
				data.pin = this._getPinByExpanderPinAndIndex(i, data.real_pin);
				data.expander_index = i;
				this.emit('input', data);
			});

      this._pcf_instances.push(pcf);
    });
  }

  //index starts from 1-x
  enableInterrupt(index, pin) {
		//TODO: params validationi

		return this._pcf_instances[index - 1].enableInterrupt(pin);
  }

  disableInterrupt() {
		this._pcf_instances.forEach(pcf => {
      pcf.disableInterrupt();
    });
  }

  inputPin(pin, inverted) {
		//TODO:params validation

		let expData = this._getExpanderPinAndIndex(index, pin);

		return this._pcf_instances[expData.index].inputPin(expData.pin, inverted);
  }

  outputPin(pin, inverted, initialValue) {
		//TODO: params validation

		let expData = this._getExpanderPinAndIndex(index, pin);

		return this._pcf_instances[expData.index].outputPin(expData.pin, inverted, initialValue);
  }

  setPin(pin, value) {
		//TODO: params validation

		let expData = this._getExpanderPinAndIndex(index, pin);

		return this._pcf_instances[expData.index].setPin(expData.pin, value);
  }

  getPinValue(pin) {
		//TODO: param validation

    let expData = this._getExpanderPinAndIndex(index, pin);

		return this._pcf_instances[expData.index].getPinValue(expData.pin);
  }

  setAllPins(value) {
    let promises = [];

		this._pcf_instances.forEach(pcf => {
			promises.push(pcf.setAllPins(value));
		});

    return Promise.all(promises);
  }

	removeAllListeners() {
		this._pcf_instances.forEach(pcf => {
      pcf.removeAllListeners();
    });
	}




	_getExpanderIndexByPin(pin) {
		return Math.ceil(pin / this._expander_pins_count) - 1;
	}

	_getExpanderPinByPinAndIndex(index, pin) {
		return (pin - (index  * this._expander_pins_count)) - 1;
	}

	_getPinByExpanderPinAndIndex(index, pin) {
    pin += 1;

		return (index === 0) ? pin : ((index * this._expander_pins_count) + pin);
	}

  _getExpanderPinAndIndex(index, pin) {
    let index = this._getExpanderIndexByPin(pin);
    let expanderPin = this._getExpanderPinByPinAndIndex(index, pin);

    return { index: index, pin: expanderPin };
  }
}

module.exports = PCF8574Cluster;

