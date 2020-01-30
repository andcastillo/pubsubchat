const express = require('express');

const datastorate = require('./storage');
const notification = require('../notification');
const log = require('../logger');
const app = express();
const game = require('./tictactoe');


app.get('/', function(req, res) {
    res.send('hello world')
});

app.get('/newgame', function(req, res) {
    // Register the new game for the given clientIDs. 
    //{client1, client2, game: {name, gameID, state, gameLogic}}
    //Steps:
    //1. Create the state in the backend storage
    //2. Notify the pubsub chanel of the client1 with the initial state and authorize for playing the first move
    //
    //let data = {player1: 'player1', player2: 'player2', name: 'hex', state: []};
    let data = req.query;//JSON.parse(req.query.data.replace(/'/g, '"'));
    log(data)
    datastorate.writeData('p2pgames', data).then(async function(result) {
        let gameid = result._path.segments[1];
        await notification.createChatClient(data.player1);
        await notification.createChatClient(data.player2);

        //Notify both players about the begining of the game. The player starting the game will see the initial state. The second player must see null
        await notification.sendMessage(data.player1, {gameid, vs: data.player2, name: data.name, state: game.init()}, gameid);
        await notification.sendMessage(data.player2, {gameid, vs: data.player2, name: data.name}, gameid);

        res.send('New ' + data.name + ' has been created with ID: ' + gameid);
    })
});

app.get('/register', function(req, res) {
    //TODO register a new player for a game (clientID, gameID, options)
});

app.get('/leave', function(req, res) {
    //TODO release the clientID ending any active game
    //1. Mark any current game in the backed storage as finished
    //2. Clean the pubsub chanel for this clienID
})

app.get('/domove', function(req, res){
    let data = req.query;//JSON.parse(req.query.data.replace(/'/g, '"'));
    log(data)
    datastorate.writeData('p2pgames', data).then(async function(result) {
        /*let gameid = result._path.segments[1];
        await notification.createChatClient(data.player1);
        await notification.createChatClient(data.player2);

        //Notify both players about the begining of the game. The player starting the game will see the initial state. The second player must see null
        await notification.sendMessage(data.player1, {gameid, vs: data.player2, name: data.name, state: game.init()}, 'p2pgames');
        await notification.sendMessage(data.player2, {gameid, vs: data.player2, name: data.name}, 'p2pgames');
        */

        res.send('OK');
    })
    //1. Verify the current movement agains the logic of the game and the state in the backend storage
    //2. Update the backend storage
    //3. Notify the next player thread about the current state of the game
});

app.listen(443, () => {console.log('App listening on port 3000')} );

//http://localhost:3000/newgame/?player1=amc&player2=mcf&name=hex&state:[]}