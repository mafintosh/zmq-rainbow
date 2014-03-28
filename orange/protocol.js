var events = require('events');

module.exports = function() {
	var protocol = new events.EventEmitter();

	protocol.parse = function(frames) {
		var signature = frames[0];

		if (!signature || signature.toString('hex') !== 'aa00') {
			protocol.emit('warning', 'invalid signature');
			return;
		}

		var cmd = frames[1] && frames[1].toString('hex');

		switch (cmd) {
			case '01': // sub
			if (!frames[2]) return protocol.emit('warning', 'invalid message 1');
			protocol.emit('subscribe', frames[2].toString());
			return;
			case '02': // pub
			if (!frames[2] || !frames[3]) return protocol.emit('warning', 'invalid message 2');
			protocol.emit('publish', frames[2].toString(), frames[3]);
			return;
			case '03': // deliver
			if (!frames[2] || !frames[3]) return protocol.emit('warning', 'invalid message 3');
			protocol.emit('deliver', frames[2].toString(), frames[3]);
			return;
			case '04': // wtf
			if (!frames[2]) return protocol.emit('warning', 'invalid message 4');;
			protocol.emit('wtf', frames[2].toString());
			return;
		}

		protocol.emit('warning', 'unknown command', cmd);
	};

	protocol.subscribe = function(channel) {
		return [new Buffer([0xaa, 0x00]), new Buffer([0x01]), channel];
	};

	protocol.publish = function(channel, content) {
		return [new Buffer([0xaa, 0x00]), new Buffer([0x02]), channel, content];
	};

	protocol.deliver = function(channel, content) {
		return [new Buffer([0xaa, 0x00]), new Buffer([0x03]), channel, content];
	};

	protocol.wtf = function(reason) {
		return [new Buffer([0xaa, 0x00]), new Buffer([0x04]), reason];
	};

	return protocol;
};