var events = require('events');

module.exports = function() {
	var protocol = new events.EventEmitter();

	protocol.parse = function(frames) {
		var signature = frames[0];
		var content = frames[1];

		if (!signature || signature.toString('hex').indexOf('aaa0') !== 0) {
			protocol.emit('warning', 'invalid signature');
			return;
		}

		var cmd = signature[2];

		switch (cmd) {
			case 1: // sub
			protocol.emit('subscribe', signature.slice(4).toString());
			return;
			case 2: // pub
			if (!content) return protocol.emit('warning', 'invalid message 2');
			protocol.emit('publish', signature.slice(4).toString(), content);
			return;
			case 3: // deliver
			if (!content) return protocol.emit('warning', 'invalid message 3');
			protocol.emit('deliver', signature.slice(4).toString(), content);
			return;
			case 4: // wtf
			protocol.emit('wtf', signature.slice(4).toString());
			return;
		}

		protocol.emit('warning', 'unknown command', cmd);
	};

	var fromString = function(str) {
		var buf = new Buffer('0'+str);
		buf[0] = str.length;
		return buf;
	};

	protocol.subscribe = function(channel) {
		return [Buffer.concat([new Buffer([0xaa, 0xa0, 0x01]), fromString(channel)])];
	};

	protocol.publish = function(channel, content) {
		return [Buffer.concat([new Buffer([0xaa, 0xa0, 0x02]), fromString(channel)]), content];
	};

	protocol.deliver = function(channel, content) {
		return [Buffer.concat([new Buffer([0xaa, 0xa0, 0x03]), fromString(channel)]), content];
	};

	protocol.wtf = function(reason) {
		return [Buffer.concat([new Buffer([0xaa, 0xa0, 0x04]), fromString(reason)])];
	};

	return protocol;
};