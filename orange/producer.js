var zmq = require('zmq');
var sock = zmq.socket('dealer');
var protocol = require('./protocol');


module.exports = function(addr) {
	var p = protocol();

	sock.connect('tcp://'+addr+':30002');

	var fn = function(channel, message) {
		sock.send(p.publish(channel, message));
	};

	fn.protocol = p;
	fn.sock = sock;

	return fn;
};
