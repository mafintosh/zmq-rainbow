var zmq = require('zmq');
var sock = zmq.socket('dealer');

sock.connect('tcp://127.0.0.1:3000');

sock.send('hello ', zmq.ZMQ_SNDMORE);
sock.send('world');
