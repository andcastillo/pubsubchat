const admin = require('firebase-admin');
const log = require('../logger');

//let serviceAccount = require('/home/acastillo/.ssh/firebase.json');

admin.initializeApp(
//    {credential: admin.credential.cert(serviceAccount)}
);

let db = admin.firestore();

/**
 * Writes new data to the firestore database
 * @param {*} collection 
 * @param {*} data 
 * @param {*} document 
 */
function writeData(collection, data, document, field) {
    try {
        if (document) {
            if (field) {
                return db.collection(collection).doc(document).collection(field).add(data);
            } else {
                return db.collection(collection).doc(document).set(data);
            }
        } else {
            return db.collection(collection).add(data);
        }
    } catch(e) {
        log(e);
    }
    
   
}

function getCollection(collection) {
    return db.collection(collection);
}

function getStates(collection, doc, res) {
    return db.collection(collection).doc(doc).collection('states').where('index', '>', 0).get().then(snapshot => {
        //log(snapshot)
        if (snapshot.empty) {
          log('No matching documents.');
          return;
        } 
        let result = [];
        snapshot.forEach(function(docx) {
            console.log(docx.id);
            //res.send({id: docx.id, data: docx.data()});
            result.push({id: docx.id, data: docx.data()});
        }); 
        //return;
        return result;
      })
      .catch(err => {
        log('Error getting documents', err);
      });
}

function getLastState(collection, doc, res) {
    return db.collection(collection).doc(doc).collection('states').orderBy('index', 'desc').limit(1).get().then(snapshot => {
        //log(snapshot)
        if (snapshot.empty) {
          log('No matching documents.');
          return;
        } 
        let result = [];
        snapshot.forEach(function(docx) {
            //console.log(docx.id);
            //res.send({id: docx.id, data: docx.data()});
            result.push({id: docx.id, data: docx.data()});
        }); 
        //return;
        return result[0];
      })
      .catch(err => {
        log('Error getting documents', err);
      });
}

module.exports = {writeData, getCollection, getStates, getLastState};

//writeData('p2pgames', {player1: 'amc2', player2: 'ljb2'}, 'gameTest').then(res => console.log(res))