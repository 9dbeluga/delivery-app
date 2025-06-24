// backend/src/controllers/userController.js (UPDATED - Clerk metadata calls removed)
import { db } from '../config/db.js'; // Correct path to your Drizzle DB client
import { users } from '../db/schema.js'; // Correct path to your Drizzle schema
import { eq } from 'drizzle-orm'; 

// --- REMOVED: import { Clerk } from '@clerk/clerk-sdk-node'; ---
// --- REMOVED: const clerk = Clerk({...}); ---

const userController = {
  saveAddress: async (req, res) => {
    const { email, address } = req.body; 

    if (!email || !address || !address.street || !address.city) {
      return res.status(400).json({ error: 'Email, street address, and city are required.' });
    }

    try {
      // Save/update address in your Neon database (this part remains, it's correct)
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

      // --- REMOVED: All Clerk metadata update logic from here ---
      // This logic no longer belongs here as per your requirement.

      res.status(200).json({ message: 'Address saved successfully!', address: result[0] });

    } catch (error) {
      console.error('Error saving address to database:', error);
      res.status(500).json({ error: 'Failed to save address due to a server error.' });
    }
  },

  getAddress: async (req, res) => {
    const { email } = req.query; 

    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required to fetch address.' });
    }

    try {
      // Fetch address from your Neon database (this part remains, it's correct)
      const userAddress = await db.select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1); 

      if (userAddress.length > 0) {
        res.status(200).json(userAddress[0]); 
      } else {
        // Return 404 if no address is found, this is important for frontend check
        res.status(404).json({ message: 'Address not found for this user.' });
      }
    } catch (error) {
      console.error('Error fetching address from database:', error);
      res.status(500).json({ error: 'Failed to fetch address due to a server error.' });
    }
  },
};

export default userController;