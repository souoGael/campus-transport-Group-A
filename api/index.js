const express = require("express");
const cors = require("cors");
const app = express();
const admin = require('firebase-admin');

// Initialize the Firebase Admin SDK
const serviceAccount = require('./serviceAccount.js');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  
const db = admin.firestore();

app.use(cors());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Allow all origins or specify your origin
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
  }
  next();
});

app.get("/", (req, res) => { res.send("Express campus-transportation live") } );

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

// API route to fetch data from Firestore about rent
app.get('/getRent', async (req, res) => {
    try {
      const snapshot = await db.collection('Rental Station Inventory').get();
  
      let data = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching data', error });
    }
  });

// API route to fetch data from Firestore about rent
app.get('/getEvents', async (req, res) => {
  try {
    const snapshot = await db.collection('Events').get();

    let data = [];
    snapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data', error });
  }
});

// API route to fetch data from Firestore about main locations
app.get('/getLocations', async (req, res) => {
  try {
    const snapshot = await db.collection('Buildings').get();

    let data = [];
    snapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data', error });
  }
});
  
// Rent
app.post('/rent/:userId/:item/:location', async (req, res) => {
    const { userId, item, location } = req.params; // Get userId and location from the request body

    try {

        const decrement = admin.firestore.FieldValue.increment(-1);

        // Reference to the rental document
        const rentalRef = db.collection('Rental Station Inventory').doc(item);
        const rentalDoc = await rentalRef.get();

        if (!rentalDoc.exists) {
          return res.status(404).json({ message: 'Rental item not found' });
        }

        const rentalData = rentalDoc.data();

        // Check availability
        if (rentalData.availability <= 0) {
          return res.status(400).json({ message: 'Item not available for rent' });
        }

        // Decrease availability
        rentalRef.update({
          availability: decrement
        });

        // Reference to the user document
        const userRef = db.collection('Users').doc(userId);
        
        // Fetch the user document
        const userDoc = await userRef.get();

        // Check if the user document exists
        if (!userDoc.exists) {
          return res.status(404).json({ message: 'User not found' });
        }

        // Update the document by adding a new field
        await userRef.update({
          item: item,
          location: location // Add or update the location field
        });

        return res.status(200).json({ message: 'Location added successfully' });
    } catch (error) {
        console.error('Error updating document: ', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Rent event
app.post('/event/:userId/:item/:location', async (req, res) => {
  const { userId, item, location } = req.params; // Get userId and location from the request body

  try {

      const decrement = admin.firestore.FieldValue.increment(-1);

      // Reference to the rental document
      const rentalRef = db.collection('Events').doc(item);
      const rentalDoc = await rentalRef.get();

      if (!rentalDoc.exists) {
        return res.status(404).json({ message: 'Rental item not found' });
      }

      const rentalData = rentalDoc.data();

      // Check availability
      if (rentalData.availability <= 0) {
        return res.status(400).json({ message: 'Item not available for rent' });
      }

      // Decrease availability
      rentalRef.update({
        availability: decrement
      });

      // Reference to the user document
      const userRef = db.collection('Users').doc(userId);
      
      // Fetch the user document
      const userDoc = await userRef.get();

      // Check if the user document exists
      if (!userDoc.exists) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update the document by adding a new field
      await userRef.update({
        item: item,
        location: location // Add or update the location field
      });

      return res.status(200).json({ message: 'Location added successfully' });
  } catch (error) {
      console.error('Error updating document: ', error);
      return res.status(500).json({ message: 'Internal server error' });
  }
});


// Complete Rental
app.post('/complete-rent/:userId/:item', async (req, res) => {
  const { userId, item } = req.params; // Get userId and item from the request params

  try {
      // Increment availability
      const increment = admin.firestore.FieldValue.increment(1);

      // Reference to the rental document
      const rentalRef = db.collection('Rental Station Inventory').doc(item);
      const rentalDoc = await rentalRef.get();

      if (!rentalDoc.exists) {
          return res.status(404).json({ message: 'Rental item not found' });
      }

      // Increment the availability of the rental item
      await rentalRef.update({
          availability: increment
      });

      // Reference to the user document
      const userRef = db.collection('Users').doc(userId);
      
      // Fetch the user document
      const userDoc = await userRef.get();

      // Check if the user document exists
      if (!userDoc.exists) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Remove the 'item' and 'location' fields from the user's document
      await userRef.update({
          item: admin.firestore.FieldValue.delete(),
          location: admin.firestore.FieldValue.delete()
      });

      return res.status(200).json({ message: 'Rental cancelled and fields removed successfully' });
  } catch (error) {
      console.error('Error cancelling rental: ', error);
      return res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;
