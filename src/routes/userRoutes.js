// backend/src/routes/userRoutes.js
import { Router } from 'express'; 
import userController from '../controllers/userController.js'; // <<< ADD .js here

const router = Router(); 

router.post('/address', userController.saveAddress);

export default router;