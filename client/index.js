const { io } = require('socket.io-client');
const config = require('../config');

const port = config.get('port');
const session = config.get('session');
const username = config.get('username');

const uri = `ws://localhost:${port}`;
const opts = { query: { session, username } };
const socket = io(uri, opts);

socket.on('connect', () => {
  console.info('Connected');
  setInterval(() => {
    const randomString = Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, '')
      .substr(0, 10);
    console.log(`Send: ${randomString}`);
    socket.emit('message', randomString);
  }, 3000);
});

socket.on('message', (sender, message) => {
  console.log(`${sender}: ${message}`);
});

socket.on('disconnect', () => {
  console.info('Disconnected');
});
