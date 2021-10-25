const { expect } = require('chai');
const {
  attachSubscriptionHandler,
  subscribeToSession,
  unsubscribeFromSession,
  publish,
} = require('./broker');

describe('broker', () => {
  describe('attachSubscriptionHandler', () => {
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
