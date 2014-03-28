var zmq = require('zmq');

var input = zmq.socket('dealer');
var output = zmq.socket('pub');
var router = zmq.socket('router');

input.bindSync('tcp://0.0.0.0:30000');
output.bindSync('tcp://0.0.0.0:30001');
router.bindSync('tcp://0.0.0.0:30002');

var subscribers = {};

input.on('message', function(channel, message) {
	console.log('onmessage', channel.toString(), message.length);

	Object.keys(subscribers).forEach(function(key) {
		if (channel.toString().indexOf(subscribers[key]) !== 0) return;
		router.send(new Buffer(key, 'hex'), zmq.ZMQ_SNDMORE);
		router.send(message);
	});

	output.send(channel, zmq.ZMQ_SNDMORE);
	output.send(message);
});

router.on('message', function(channel, message) {
	console.log('router onmessage', channel.toString('hex'), message.length);
	channel = channel.toString('hex');
	subscribers[channel] = message.toString();
});