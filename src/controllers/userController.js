// backend/src/controllers/userController.js (UPDATED)
import { db } from '../config/db.js'; 
import { users } from '../db/schema.js'; 
import { eq } from 'drizzle-orm'; 
import { Clerk } from '@clerk/clerk-sdk-node'; // <<< NEW IMPORT

// Initialize Clerk with your secret key from environment variables
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
          limit: 1 // We only expect one user with this email
        });

        if (clerkUsers.length > 0) {
          const clerkUser = clerkUsers[0];
          await clerk.users.updateUser(clerkUser.id, {
            publicMetadata: {
              ...clerkUser.publicMetadata, // Spread existing metadata
              hasAddress: true,           // Add/update hasAddress flag
            },
          });
          console.log(`Clerk user ${clerkUser.id} publicMetadata updated: hasAddress=true`);
        } else {
          console.warn(`Clerk user with email ${email} not found. Cannot update publicMetadata.`);
          // You might choose to still return success if DB save was the primary goal
        }
      } catch (clerkError) {
        console.error('Error updating Clerk user publicMetadata:', clerkError);
        // Do not throw this error, as the address was already saved to your DB.
        // Just log it and send success response for the address save.
      }

      res.status(200).json({ message: 'Address saved successfully!', address: result[0] });

    } catch (error) {
      console.error('Error saving address to database:', error);
      res.status(500).json({ error: 'Failed to save address due to a server error.' });
    }
  },
};

export default userController;