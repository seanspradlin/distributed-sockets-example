const { expect } = require('chai');
const EventEmitter = require('events');
const {
  registerSocket,
  deregisterSocket,
  send,
  createSocket,
} = require('./socket');

describe('socket', () => {
  describe('registerSocket', () => {
    it('should add the socket to the distribution list', () => {
      const context = {
        sessions: {},
        events: {
          emit() {},
        },
      };
      const socket = {
        id: 'baz',
        on() {},
        handshake: {
          query: {
            session: 'foo',
            username: 'Bob',
          },
        },
      };

      registerSocket.call(context, socket);
      const expectedSessions = {
        foo: { baz: socket },
      };
      expect(context.sessions).to.deep.equal(expectedSessions);
    });
  });

  describe('deregisterSocket', () => {
    it('should remove the socket to the distribution list', () => {
      const socket = {
        id: 'baz',
        on() {},
        handshake: {
          query: {
            session: 'foo',
            username: 'Bob',
          },
        },
      };
      const context = {
        sessions: {
          foo: {
            baz: socket,
          },
        },
        events: {
          emit() {},
        },
      };

      deregisterSocket.call(context, socket);
      const expectedSessions = {};
      expect(context.sessions).to.deep.equal(expectedSessions);
    });
  });

  describe('send', () => {
    it('should dispatch a call to all sockets correctly', async () => {
      const calledArgs = {};
      const context = {
        sessions: {
          session1: [
            {
              handshake: { query: { username: 'Bob' } },
              emit(...args) {
                calledArgs.emit = args;
              },
            },
            {
              handshake: { query: { username: 'Jane' } },
              emit() {
                throw new Error('Should not have been called');
              },
            },
          ],
          session2: [
            {
              handshake: { query: { username: 'Jack' } },
              emit() {
                throw new Error('Should not have been called');
              },
            },
          ],
        },
      };

      send.call(context, 'session1', 'Jane', 'Hello');
      expect(calledArgs.emit).to.deep.equal(['message', 'Jane', 'Hello']);
    });
  });

  describe('createSocket', () => {
    const io = new EventEmitter();
    const dependencies = { io };
    const socket = createSocket(dependencies);
    expect(socket).to.have.property('send').that.is.a('function');
  });
});
