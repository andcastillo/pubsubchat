const express = require('express');

const datastorate = require('./storage');
const notification = require('../notification');
const { PubSub } = require('@google-cloud/pubsub');
const log = require('../logger');
const app = express();
const game = require('./tictactoe');

const masterID = 'p2pgames';

app.get('/', function (req, res) {
    res.send('hello world')
});

app.get('/newgame', function (req, res) {
    // Register the new game for the given clientIDs. 
    //{client1, client2, game: {name, gameID, state, gameLogic}}
    //Steps:
    //1. Create the state in the backend storage
    //2. Notify the pubsub chanel of the client1 with the initial state and authorize for playing the first move
    //
    //let data = {player1: 'player1', player2: 'player2', name: 'hex', state: []};
    let data = req.query;//JSON.parse(req.query.data.replace(/'/g, '"'));
    log(data)
    datastorate.writeData(masterID, data).then(async function (result) {
        let gameid = result._path.segments[1];
        await notification.createChatClient(data.player1);
        await notification.createChatClient(data.player2);

        //Notify both players about the begining of the game. The player starting the game will see the initial state. The second player must see null
        await notification.sendMessage(data.player1, { gameid, next: data.player2, name: data.name, state: game.init(), index: 0 }, masterID);
        await notification.sendMessage(data.player2, { gameid, next: data.player1, name: data.name }, masterID);

        res.send('New ' + data.name + ' has been created with ID: ' + gameid);
    })
});

app.get('/register', function (req, res) {
    //TODO register a new player for a game (clientID, gameID, options)
});

app.get('/leave', function (req, res) {
    //TODO release the clientID ending any active game
    //1. Mark any current game in the backed storage as finished
    //2. Clean the pubsub chanel for this clienID
})

let argv = process.argv.slice(2)
let port = argv[0];
app.listen(port, () => {
    log(`App listening on port ${port}`);

});

// http://localhost:3000/newgame/?player1=geo&player2=and&name=hex&state:[]
// node src/chat/tictactoeClient.js geo
// node src/chat/tictactoeClient.js and
/*
[[0,0,0],[0,1,0],[0,0,0]]
[[0,0,0],[0,1,0],[0,2,0]]
[[0,0,0],[0,1,0],[0,2,1]]
[[2,0,0],[0,1,0],[0,2,1]]
[[2,0,0],[0,1,1],[0,2,1]]
[[2,0,0],[2,1,1],[0,2,1]]
[[2,0,1],[2,1,1],[0,2,1]]
*/
const credentials = {
    keyFilename: '/home/acastillo/.ssh/backup.json',
    projectId: 'shareapp-1546879226834',
};

const pubsub = new PubSub(credentials);

function listenForMessages(subscriptionName, timeout) {

    // References an existing subscription
    const subscription = pubsub.subscription(subscriptionName + '_');

    // Create an event handler to handle messages
    const messageHandler = message => {
        log(message.data.toString())
        let data = JSON.parse(message.data.toString());
        let promise = notification.sendMessage(data.next, { gameid: data.gameid, next: message.attributes.sender, name: data.name, state: data.state, index: data.index + 1 }, masterID);
        promise.then(() => {
            datastorate.writeData(masterID, 
                {state: JSON.stringify(data.state), sender: message.attributes.sender, index: data.index + 1}, data.gameid, 'states')
                .then(() => log(`Updated states of document ${data.gameid}`))
                .catch(e => log(e))
            // "Ack" (acknowledge receipt of) the message
            message.ack();
        });
    };
    // Listen for new messages until timeout is hit
    subscription.on(`message`, messageHandler);

    setTimeout(() => {
        subscription.removeListener('message', messageHandler);
        log(`${messageCount} message(s) received.`);
    }, timeout * 1000);
}

listenForMessages(masterID, 60000);