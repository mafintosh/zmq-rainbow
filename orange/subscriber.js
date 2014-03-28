var zmq = require('zmq');
var sock = zmq.socket('dealer');

module.exports = function(addr, channel) {
	sock.connect('tcp://'+addr+':30002');
	sock.send(channel || '');

	return function sub(fn) {
		sock.on('message', function(message) {
			fn(message);
		});
	};
};