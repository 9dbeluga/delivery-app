// backend/src/controllers/userController.js (UPDATED with getAddress)
import { db } from '../config/db.js'; 
import { users } from '../db/schema.js'; 
import { eq } from 'drizzle-orm'; 
import { Clerk } from '@clerk/clerk-sdk-node';

const clerk = Clerk({
  secretKey: process.env.CLERK_SECRET_KEY,
});

const userController = {
  saveAddress: async (req, res) => {
    const { email, address } = req.body; 

    if (!email || !address || !address.street || !address.city) {
      return res.status(400).json({ error: 'Email, street address, and city are required.' });
    }

    try {
      // 1. Save/update address in your database
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

      // 2. Find the user in Clerk using their email and update publicMetadata
      try {
        const clerkUsers = await clerk.users.getUserList({
          emailAddress: [email],
          limit: 1 
        });

        if (clerkUsers.length > 0) {
          const clerkUser = clerkUsers[0];
          await clerk.users.updateUser(clerkUser.id, {
            publicMetadata: {
              ...clerkUser.publicMetadata, 
              hasAddress: true,           
            },
          });
          console.log(`Clerk user ${clerkUser.id} publicMetadata updated: hasAddress=true`);
        } else {
          console.warn(`Clerk user with email ${email} not found. Cannot update publicMetadata.`);
        }
      } catch (clerkError) {
        console.error('Error updating Clerk user publicMetadata:', clerkError);
      }

      res.status(200).json({ message: 'Address saved successfully!', address: result[0] });

    } catch (error) {
      console.error('Error saving address to database:', error);
      res.status(500).json({ error: 'Failed to save address due to a server error.' });
    }
  },

  // --- NEW: Function to get a user's address ---
  getAddress: async (req, res) => {
    const { email } = req.query; // Using req.query for GET request parameters

    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required to fetch address.' });
    }

    try {
      const userAddress = await db.select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1); // Expecting at most one address per email

      if (userAddress.length > 0) {
        res.status(200).json(userAddress[0]); // Send the first (and only) result
      } else {
        res.status(404).json({ message: 'Address not found for this user.' });
      }
    } catch (error) {
      console.error('Error fetching address from database:', error);
      res.status(500).json({ error: 'Failed to fetch address due to a server error.' });
    }
  },
};

export default userController;