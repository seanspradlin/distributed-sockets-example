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

async function publish(session, message) {
  console.log(`Publishing ${session}:${message}`);
  return new Promise((resolve, reject) => {
    this.publisher.publish(session, message, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

function createBroker({ redis }) {
  const broker = {
    subscriber: redis.duplicate(),
    publisher: redis.duplicate(),
    subscribeToSession,
    unsubscribeFromSession,
    publish,
  };
  return broker;
}

module.exports = {
  createBroker,
  subscribeToSession,
  unsubscribeFromSession,
  publish,
};
