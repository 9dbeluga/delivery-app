// backend/src/routes/userRoutes.js
import { Router } from 'express'; // Import Router from Express
import userController from '../controllers/userController'; // Import the user controller

const router = Router(); // Create an Express router instance

// Define a POST route for saving/updating user addresses.
// This route will handle requests to '/api/user/address' (when mounted in server.js)
router.post('/address', userController.saveAddress);

export default router; // Export the router