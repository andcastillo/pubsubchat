'use strict';
//export GOOGLE_APPLICATION_CREDENTIALS=~/.ssh/backup.json"
const log = require('./logger')

const { PubSub } = require('@google-cloud/pubsub');

const credentials = {
  keyFilename: '/home/acastillo/.ssh/backup.json',
  projectId: 'shareapp-1546879226834',
};

const pubSubClient = new PubSub(credentials);


async function createChatClient(clientID) {
  try {
    let topic = await pubSubClient.createTopic(clientID);
    if (topic) {
      log(`Topic ${topic} created.`);
      try {
        let message = await pubSubClient.topic(clientID).createSubscription(clientID + '_');
        if (message) {
          log(`Succeed Subscription to ${clientID} returned ${message}`);
          return message;
        }
      } catch (e2) {
        log(`${clientID}: could not subscribe to chanel`);
        //log(e2);
        return 0;
      }
    }
  } catch (e) {
    log(`${clientID}:  already a client?. Waiting for messages`);
    // log(e);
    return 0;
  };

}

async function sendMessage(toClientID, data, fromClientID) {
  const dataBuffer = Buffer.from(JSON.stringify(data));
  const messageId = await pubSubClient.topic(toClientID).publish(dataBuffer, { sender: fromClientID });
  log(`Message ${messageId} published.`);
}

module.exports = { sendMessage, createChatClient }

/*let argv = process.argv.slice(2);
let toClientID = argv[0];
let message = argv[1];


chatToClient(toClientID, message);*/