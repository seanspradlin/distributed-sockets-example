const EventEmitter = require('events');

async function subscribeToSession(session) {
  console.info(`Subscribing to session ${session}`);
  return new Promise((resolve, reject) => {
    this.subscriber.subscribe(session, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

async function unsubscribeFromSession(session) {
  console.info(`Unsubscribing from session ${session}`);
  return new Promise((resolve, reject) => {
    this.subscriber.unsubscribe(session, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

async function publish(session, sender, message) {
  console.log(`Publishing ${session}:${sender}:${message}`);
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify([sender, message]);
    this.publisher.publish(session, payload, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

function attachSubscriptionHandler() {
  this.subscriber.on('message', (session, payload) => {
    const [sender, message] = JSON.parse(payload);
    this.events.emit('message', session, sender, message);
  });
}

function createBroker({ redis }) {
  const events = new EventEmitter();
  const broker = {
    events,
    subscriber: redis.duplicate(),
    publisher: redis.duplicate(),
    subscribeToSession,
    unsubscribeFromSession,
    publish,
  };
  attachSubscriptionHandler.call(broker);
  return broker;
}

module.exports = {
  createBroker,
  attachSubscriptionHandler,
  subscribeToSession,
  unsubscribeFromSession,
  publish,
};
