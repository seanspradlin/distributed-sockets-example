const { Server } = require('socket.io');
const Redis = require('ioredis');
const config = require('../config');
const { createBroker } = require('./broker');
const { createSocket } = require('./socket');

const port = config.get('port');
const redisPort = config.get('redis.port');
const io = new Server(port);
const redis = new Redis(redisPort);
const broker = createBroker({ redis });
const socket = createSocket({ io });

socket.events.on('subscribe', async (session) => {
  await broker.subscribeToSession(session);
});

socket.events.on('unsubscribe', async (session) => {
  await broker.unsubscribeFromSession(session);
});

socket.events.on('message', async (session, sender, message) => {
  await broker.publish(session, sender, message);
});

broker.events.on('message', async (session, sender, message) => {
  await socket.send(session, sender, message);
});
