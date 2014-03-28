var zmq = require('zmq');
var sock = zmq.socket('dealer');
var protocol = require('./protocol');

module.exports = function(addr, channel) {
	sock.connect('tcp://'+addr+':30002');

	return function sub(fn) {
		var p = protocol();

		sock.send(p.subscribe(channel));

		p.on('deliver', function(channel, message) {
			fn(channel, message);
		});

		sock.on('message', function(message) {
			p.parse(Array.prototype.slice.call(arguments))
		});
	};
};