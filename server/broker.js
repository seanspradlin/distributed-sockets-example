const EventEmitter = require('events');

/**
  * Subscribe to a session
  * @async
  * @param {string} session
  * @returns {promise}
  */
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

/**
  * Unsubscribe from the session when all interested parties have disconnected
  * @async
  * @param {string} session
  * @returns {promise}
  */
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

/**
  * Sends a message up to the broker to be distributed among peers
  * @async
  * @param {String} session
  * @param {String} sender
  * @param {String} message
  * @returns {Promise}
  */
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

/**
  * Middleware handler to convert Redis subscriber output into our preferred
  * format.
  */
function attachSubscriptionHandler() {
  this.subscriber.on('message', (session, payload) => {
    const [sender, message] = JSON.parse(payload);
    this.events.emit('message', session, sender, message);
  });
}

/**
  * A service for connecting to a backend like Redis or Kafka for pubsub
  * messaging
  * @typedef {Object} Broker
  * @property {EventEmitter} events
  * @property {Function} subscribeToSession
  * @property {Function} unsubscribeFromSession
  * @property {Function} publish
  */

/**
  * Creates an instance of the broker and initializes it
  * @param {Object} dependencies
  * @param {RedisClient} dependencies.redis
  * @returns {Broker}
  */
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
