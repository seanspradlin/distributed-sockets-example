const EventEmitter = require('events');

async function send(session, username, message) {
  const sockets = this.sessions[session];
  if (!sockets) {
    throw new Error(`Session ${session} not found`);
  }
  Object.values(sockets).forEach((socket) => {
    const user = socket.handshake.query.username;
    if (username !== user) {
      socket.emit('message', username, message);
    }
  });
}

function registerSocket(socket) {
  console.info(`${socket.id} connected`);
  const { session, username } = socket.handshake.query;
  if (!this.sessions[session]) {
    this.sessions[session] = {};
    this.events.emit('subscribe', session);
  }
  this.sessions[session][socket.id] = socket;
  socket.on('message', (message) => {
    this.events.emit('message', session, username, message);
  });
}

function deregisterSocket(socket) {
  console.info(`${socket.id} disconnected`);
  const { session } = socket.handshake.query;
  delete this.sessions[session][socket.id];
  const remainingSessions = Object.keys(this.sessions[session]).length;
  if (!remainingSessions) {
    console.info(`No more connections to session ${session}`);
    delete this.sessions[session];
    this.events.emit('unsubscribe', session);
  }
}

function createSocket({ io }) {
  const events = new EventEmitter();
  const sessions = {};
  const socketService = {
    io,
    deregisterSocket,
    events,
    registerSocket,
    send,
    sessions,
  };

  io.on('connection', (socket) => {
    socketService.registerSocket(socket);
    socket.on('disconnect', () => {
      socketService.deregisterSocket(socket);
    });
  });

  return socketService;
}

module.exports = {
  createSocket,
  deregisterSocket,
  registerSocket,
  send,
};
