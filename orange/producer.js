var zmq = require('zmq');
var sock = zmq.socket('dealer');

sock.connect('tcp://127.0.0.1:30000');

var publish = function(channel, message) {
	sock.send(channel, zmq.ZMQ_SNDMORE);
	sock.send(message);
};

setInterval(function() {
	console.log('publising');
	publish('orange', 'hello world');
}, 1000);
