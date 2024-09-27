const { app } = require('@azure/functions');
const {db,admin} = require('./firebaseDB');

app.http('rent', {
    route: "rent/{id}/{rentId}/{location}",
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, res) => {
        // const { rentalId, userId, item, location } = request.body; // Get userId and location from the request body

        const userId = request.params.id;
        const rentalId = request.params.rentId;
        const item = request.params.rentId;
        const location = request.params.location;
        // console.log('rentalId:', rentalId);  // Check rentalId value
        // console.log('userId:', userId);

        try {
            
            const decrement = admin.firestore.FieldValue.increment(-1);

            // Reference to the rental document
            const rentalRef = db.collection('Rental Station Inventory').doc(rentalId);
            const rentalDoc = await rentalRef.get();

            if (!rentalDoc.exists) {
                return { message: 'Rental item not found' };
            }

            const rentalData = rentalDoc.data();

            // Check availability
            if (rentalData.availability <= 0) {
                return { message: 'Item not available for rent' };
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
                return { message: 'User not found' };
            }

            // Update the document by adding a new field
            await userRef.update({
                item: item,
                location: location // Add or update the location field
            });

            return { message: 'Location added successfully' };
        } catch (error) {
            console.error('Error updating document: ', error);
            return { message: 'Internal server error' };
        }
    }
});
