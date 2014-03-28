var zmq = require('zmq');

var input = zmq.socket('dealer');
var output = zmq.socket('dealer');

input.bindSync('tcp://127.0.0.1:3000');
output.bindSync('tcp://127.0.0.1:3001');

input.on('message', function(channel, message) {
	console.log('onmessage', channel.toString(), message.length);
	output.send(channel, zmq.ZMQ_SNDMORE);
	output.send(message);
});