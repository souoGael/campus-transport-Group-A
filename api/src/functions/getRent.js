const { app } = require('@azure/functions');
const {db} = require('./firebaseDB');

app.http('getRent', {
    route: "getRent",
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
      console.log("Received request for getRent");
        try {
            const snapshot = await db.collection('Rental Station Inventory').get();
        
            let data = [];
            snapshot.forEach((doc) => {
              data.push({ id: doc.id, ...doc.data() });
            });
             return { body: JSON.stringify(data) };
          } catch (error) {
            return { message: 'Error fetching data', error };
          }
    }
});
