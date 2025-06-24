// backend/src/routes/userRoutes.js (UPDATED with getAddress route)
import { Router } from 'express'; 
import userController from '../controllers/userController.js'; 

const router = Router(); 

router.post('/address', userController.saveAddress);
router.get('/address', userController.getAddress); // <<< NEW: GET route for address

export default router;