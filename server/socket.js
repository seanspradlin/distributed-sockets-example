const EventEmitter = require('events');

/**
  * Sends a message to all sockets listening to a session
  * @async
  * @param {String} session
  * @param {String} username
  * @param {String} message
  * @returns {Promise}
  */
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

/**
  * Registers a socket to distribution list
  * @param {Socket} socket
  */
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

/**
  * Unregisters a socket from distribution list
  * @param {Socket} socket
  */
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

/**
  * @typedef {Object} SocketService
  * @property {Function} send
  */

/**
  * Creates an instance of the socket service and initializes it
  * @param {Object} dependencies
  * @param {SocketioAgent} dependencies.io
  * @returns {SocketService}
  */
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
