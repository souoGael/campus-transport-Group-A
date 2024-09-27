// firebase.js
const admin = require("firebase-admin");
const serviceAccount = require('./serviceAccount.js');

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	storageBucket: "campus-transportation-82bea.appspot.com",
});

const db = admin.firestore();
const storage = admin.storage();
module.exports = {db,storage,admin};