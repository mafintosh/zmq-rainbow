var events = require('events');

module.exports = function() {
	var protocol = new events.EventEmitter();

	protocol.parse = function(frames) {
		var signature = frames[0];
		var content = frames[1];

		if (!signature || signature.toString('hex').indexOf('aa00') !== 0) {
			protocol.emit('warning', 'invalid signature');
			return;
		}

		var cmd = signature[2];

		switch (cmd) {
			case 1: // sub
			protocol.emit('subscribe', signature.slice(3).toString());
			return;
			case 2: // pub
			if (!content) return protocol.emit('warning', 'invalid message 2');
			protocol.emit('publish', signature.slice(3).toString(), content);
			return;
			case 3: // deliver
			if (!content) return protocol.emit('warning', 'invalid message 3');
			protocol.emit('deliver', signature.slice(3).toString(), content);
			return;
			case 4: // wtf
			protocol.emit('wtf', signature.slice(3).toString());
			return;
		}

		protocol.emit('warning', 'unknown command', cmd);
	};

	protocol.subscribe = function(channel) {
		return [Buffer.concat([new Buffer([0xaa, 0x00, 0x01]), new Buffer(channel)])];
	};

	protocol.publish = function(channel, content) {
		return [Buffer.concat([new Buffer([0xaa, 0x00, 0x02]), new Buffer(channel)]), content];
	};

	protocol.deliver = function(channel, content) {
		return [Buffer.concat([new Buffer([0xaa, 0x00, 0x03]), new Buffer(channel)]), content];
	};

	protocol.wtf = function(reason) {
		return [Buffer.concat([new Buffer([0xaa, 0x00, 0x04]), new Buffer(reason)])];
	};

	return protocol;
};