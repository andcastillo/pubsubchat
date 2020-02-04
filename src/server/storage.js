const admin = require('firebase-admin');
const log = require('../logger');

let serviceAccount = require('/home/acastillo/.ssh/firebase.json');

/*admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});*/

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

function readData(db) {

}

module.exports = {writeData, readData};

//writeData('p2pgames', {player1: 'amc2', player2: 'ljb2'}, 'gameTest').then(res => console.log(res))