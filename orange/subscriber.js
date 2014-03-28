var zmq = require('zmq');
var sock = zmq.socket('dealer');
var protocol = require('./protocol');

module.exports = function(addr, channel) {
	sock.connect('tcp://'+addr+':30002');

	var p = protocol();
	var sub = function(fn) {

		sock.send(p.subscribe(channel));

		p.on('deliver', function(channel, message) {
			fn(channel, message);
		});

		sock.on('message', function(message) {
			p.parse(Array.prototype.slice.call(arguments))
		});

		return p;
	};

	sub.protocol = p;
	sub.sock = sock;

	return sub;
};