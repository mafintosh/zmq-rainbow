#!/usr/bin/env node

var hprotocol = require('hprotocol');
var producer = require('./producer');
var subscriber = require('./subscriber');

var addr = process.argv[2] || '127.0.0.1';
var channel = process.argv[3] || '';

var pub = producer(addr);
var sub = subscriber(addr, channel);

var protocol = hprotocol()
	.use('pub channel message')
	.use('wtf')

var p = protocol();

sub(function(channel, message) {
	console.log('> '+channel+' '+message);
});

sub.protocol.on('wtf', function(reason) {
	console.log('received wtf in sub', reason);
});

pub.protocol.on('wtf', function(reason) {
	console.log('received wtf in pub', reason);
});

p.on('pub', function(channel, message) {
	pub(channel, message);
});

p.on('wtf', function() {
	pub.sock.send('hello world');
});

process.stdin.pipe(p.stream);

console.log(protocol.specification)