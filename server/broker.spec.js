const EventEmitter = require('events');
const { expect } = require('chai');
const {
  createBroker,
  attachSubscriptionHandler,
  subscribeToSession,
  unsubscribeFromSession,
  publish,
} = require('./broker');

describe('broker', () => {
  describe('attachSubscriptionHandler', () => {
    it('should emit messages from redis', (done) => {
      const context = {
        subscriber: new EventEmitter(),
        events: new EventEmitter(),
      };
      attachSubscriptionHandler.call(context);
      context.events.on('message', (session, sender, message) => {
        expect(session).to.equal('foo');
        expect(sender).to.equal('bar');
        expect(message).to.equal('baz');

        // cleanup
        context.subscriber.removeAllListeners('message');
        context.events.removeAllListeners('message');
        done();
      });
      context.subscriber.emit(
        'message',
        'foo',
        JSON.stringify(['bar', 'baz']),
      );
    });
  });

  describe('subscribeToSession', () => {
    it('should return an error in failures', (done) => {
      const calledArgs = {};
      const context = {
        subscriber: {
          subscribe(params, fn) {
            calledArgs.subscribe = params;
            fn(new Error());
          },
        },
      };
      subscribeToSession.call(context, 'foo')
        .then(() => {
          done(new Error('Should not have resolved'));
        })
        .catch(() => {
          expect(calledArgs.subscribe).to.equal('foo');
          done();
        });
    });

    it('should resolve if invoked properly', async () => {
      const calledArgs = {};
      const context = {
        subscriber: {
          subscribe(params, fn) {
            calledArgs.subscribe = params;
            fn(null, 1);
          },
        },
      };
      await subscribeToSession.call(context, 'foo');
      expect(calledArgs.subscribe).to.equal('foo');
    });
  });

  describe('unsubscribeFromSession', () => {
    it('should return an error in failures', (done) => {
      const calledArgs = {};
      const context = {
        subscriber: {
          unsubscribe(params, fn) {
            calledArgs.unsubscribe = params;
            fn(new Error());
          },
        },
      };
      unsubscribeFromSession.call(context, 'foo')
        .then(() => {
          done(new Error('Should not have resolved'));
        })
        .catch(() => {
          expect(calledArgs.unsubscribe).to.equal('foo');
          done();
        });
    });

    it('should resolve if invoked properly', async () => {
      const calledArgs = {};
      const context = {
        subscriber: {
          unsubscribe(params, fn) {
            calledArgs.unsubscribe = params;
            fn(null, 1);
          },
        },
      };
      await unsubscribeFromSession.call(context, 'foo');
      expect(calledArgs.unsubscribe).to.equal('foo');
    });
  });

  describe('publish', () => {
    it('should return an error in failures', (done) => {
      const context = {
        publisher: {
          publish(params, fn) {
            fn(new Error());
          },
        },
      };
      publish.call(context)
        .then(() => {
          done(new Error('Should not have resolved'));
        })
        .catch(() => {
          done();
        });
    });

    it('should publish the message in the proper format', async () => {
      const calledArgs = {};
      const context = {
        publisher: {
          publish(channel, message, fn) {
            calledArgs.channel = channel;
            calledArgs.message = message;
            fn();
          },
        },
      };

      await publish.call(context, 'foo', 'bar', 'baz');

      const expectedChannel = 'foo';
      const expectedMessage = JSON.stringify(['bar', 'baz']);
      expect(calledArgs.channel).to.equal(expectedChannel);
      expect(calledArgs.message).to.equal(expectedMessage);
    });
  });

  describe('createBroker', () => {
    it('should return the appropriate shape', () => {
      const redis = {
        duplicate: () => new EventEmitter(),
      };
      const broker = createBroker({ redis });
      expect(broker).to.have.property('events')
        .that.is.instanceOf(EventEmitter);
      expect(broker).to.have.property('subscribeToSession')
        .that.is.a('function');
      expect(broker).to.have.property('unsubscribeFromSession')
        .that.is.a('function');
      expect(broker).to.have.property('publish')
        .that.is.a('function');
    });
  });
});
