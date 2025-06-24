// backend/src/controllers/userController.js
// Assuming db.js is in backend/src/config/db.js, relative to backend/src/controllers/
import { db } from '../config/db.js'; // <<< CHANGE THIS LINE

import { users } from '../db/schema.js'; 
import { eq } from 'drizzle-orm'; 

const userController = {
  saveAddress: async (req, res) => {
    const { email, address } = req.body; 

    if (!email || !address || !address.street || !address.city) {
      return res.status(400).json({ error: 'Email, street address, and city are required.' });
    }

    try {
      const result = await db.insert(users)
        .values({
          email: email,
          street: address.street,
          city: address.city,
          apartment: address.apartment,
          extraInfo: address.extraInfo,
          province: address.province || 'Kinshasa', 
          country: address.country || 'Democratic Republic of Congo', 
        })
        .onConflictDoUpdate({
          target: users.email, 
          set: {                
            street: address.street,
            city: address.city,
            apartment: address.apartment,
            extraInfo: address.extraInfo,
            province: address.province || 'Kinshasa',
            country: address.country || 'Democratic Republic of Congo',
            updatedAt: new Date(), 
          },
        })
        .returning(); 

      console.log('Address saved/updated in DB:', result[0]);
      res.status(200).json({ message: 'Address saved successfully!', address: result[0] });

    } catch (error) {
      console.error('Error saving address to database:', error);
      res.status(500).json({ error: 'Failed to save address due to a server error.' });
    }
  },
};

export default userController;