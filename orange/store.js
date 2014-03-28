var zmq = require('zmq');
var protocol = require('./protocol');

var input = zmq.socket('dealer');
var output = zmq.socket('pub');
var router = zmq.socket('router');

input.bindSync('tcp://0.0.0.0:30000');
output.bindSync('tcp://0.0.0.0:30001');
router.bindSync('tcp://0.0.0.0:30002');

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

var subscribers = {};
var subscriptions = {};

router.on('message', function(envelope, message) {
	var p = protocol();

	p.on('subscribe', function(channel) {
		var c = channel.toString();
		subscriptions[c] = subscriptions[c] || [];
		subscriptions[c].push(envelope);
	});

	p.on('publish', function(channel, message) {
		var c = channel.toString();

		console.log('publish', channel, message);

		(subscriptions[c] || []).forEach(function(envelope) {
			router.send([envelope].concat(p.deliver(channel, message)));
		});

		(subscriptions[''] || []).forEach(function(envelope) {
			router.send([envelope].concat(p.deliver(channel, message)));
		});
	});

	p.on('deliver', function(channel, message) {
		console.log('deliver', channel, message);
	});

	p.on('wtf', function(reason) {
		console.log('wrf', reason);
	});

	p.parse(Array.prototype.slice.call(arguments, 1));
});