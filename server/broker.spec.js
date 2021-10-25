const EventEmitter = require('events');
const { expect } = require('chai');
const {
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

  });

  describe('publish', () => {

  });
});
