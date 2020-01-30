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
      await pubSubClient.topic(clientID).createSubscription(clientID + '_');
      log(`Subscription ${clientID} created.`);
    }
  } catch (e) {
    log(' Already a client. Waiting for messages');
  }
}

async function sendMessage(toClientID, data, fromClientID) {
  const dataBuffer = Buffer.from(JSON.stringify(data));
  const messageId = await pubSubClient.topic(toClientID).publish(dataBuffer, {sender: fromClientID});
  log(`Message ${messageId} published.`);
}

module.exports = { sendMessage, createChatClient }

/*let argv = process.argv.slice(2);
let toClientID = argv[0];
let message = argv[1];


chatToClient(toClientID, message);*/