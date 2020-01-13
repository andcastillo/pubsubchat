'use strict';
//export GOOGLE_APPLICATION_CREDENTIALS=~/.ssh/backup.json"

const {PubSub} = require('@google-cloud/pubsub');

const credentials = {
    keyFilename: '/home/acastillo/.ssh/backup.json',
    projectId: 'shareapp-1546879226834',
};

const pubSubClient = new PubSub(credentials);


async function createChatClient(clientID) {
    try{
      let topic = await pubSubClient.createTopic(clientID);
      console.log(`Topic ${topic} created.`);
      await pubSubClient.topic(clientID).createSubscription(clientID + '_');
      console.log(`Subscription ${clientID} created.`);
    } catch(e) {
        console.log(e);
        console.log(' Already a client. Waiting for messages');
    }
  
  }
  
  function subscribeToChanel(clientID) {
    async function createSubscription() {
      // Creates a new subscription
      await pubSubClient.topic(clientID).createSubscription(clientID + '_');
      console.log(`Subscription ${clientID} created.`);
    }
  
    createSubscription().catch(console.error);
  }
  
  

async function notifyClient(clientID, data) {
    const dataBuffer = Buffer.from(JSON.stringify(data));
    const messageId = await pubSubClient.topic(clientID).publish(dataBuffer);
    console.log(`Message ${messageId} published.`);
}

module.exports = {notifyClient, createChatClient}

/*let argv = process.argv.slice(2);
let toClientID = argv[0];
let message = argv[1];


chatToClient(toClientID, message);*/