var zmq = require('zmq');
var sock = zmq.socket('dealer');
var protocol = require('./protocol');


module.exports = function(addr) {
	var p = protocol();

	sock.connect('tcp://'+addr+':30002');

	sock.on('message', function() {
		p.parse(Array.prototype.slice.call(arguments));
	});

	var fn = function(channel, message) {
		sock.send(p.publish(channel, message));
	};

	fn.protocol = p;
	fn.sock = sock;

	return fn;
};
