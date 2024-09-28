const express = require("express");
const app = express();
const admin = require('firebase-admin');

// Initialize the Firebase Admin SDK
const serviceAccount = require('./serviceAccount.js');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  
const db = admin.firestore();

app.get("/", (req, res) => { res.send("Express Gael") } );

// API route to fetch data from Firestore
app.get('/getSchedule', async (req, res) => {
    try {
      const snapshot = await db.collection('Transportation Schedules').get();
  
      let data = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching data', error });
    }
  });



app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;