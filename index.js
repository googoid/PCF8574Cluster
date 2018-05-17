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
				data.pin = this._getPinByRealPin(i, data.real_pin);
				data.expander_index = i;
				this.emit('input', data);
			});

      this._pcf_instances.push(pcf);
    });
  }

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

		let index = this._getExpanderIndexByPin(pin);
		let realPin = this._getRealPin(index, pin);

		return this._pcf_instances[index].inputPin(realPin, inverted);
  }

  outputPin(pin, inverted, initialValue) {
		//TODO: params validation

		let index = this._getExpanderIndexByPin(pin);
		let realPin = this._getRealPin(index, pin);

		return this._pcf_instances[index].outputPin(realPin, inverted, initialValue);
  }

  setPin(pin, value) {
		//TODO: params validation

		let index = this._getExpanderIndexByPin(pin);
		let realPin = this._getRealPin(index, pin);

		return this._pcf_instances[index].setPin(realPin, value);
  }

  getPinValue(pin) {
		//TODO: param validation

		let index = this._getExpanderIndexByPin(pin);
    let realPin = this._getRealPin(index, pin);

		return this._pcf_instances[index].getPinValue(realPin);
  }

  setAllPins(value) {
    let promise = Promise.resolve();

		this._pcf_instances.forEach(pcf => {
      promise = promise.then(() => {
        return pcf.setAllPins(value);
      });
		});

    return promise;
  }

	removeAllListeners() {
		this._pcf_instances.forEach(pcf => {
      pcf.removeAllListeners();
    });
	}

	_getExpanderIndexByPin(pin) {
		return Math.ceil(pin / this._expander_pins_count) - 1;
	}

	_getRealPin(index, pin) {
		return (pin - (index  * this._expander_pins_count)) - 1;
	}

	_getPinByRealPin(index, realPin) {
		if (index === 0) {
			return realPin + 1;
		} else {
			return (index * this._expander_pins_count) + realPin + 1;
		}
	}
}

module.exports = PCF8574Cluster;

