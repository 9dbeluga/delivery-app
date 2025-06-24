// backend/src/routes/orderRoutes.js (CONFIRMED LATEST VERSION)
import { Router } from 'express';
import orderController from '../controllers/orderController.js';

const router = Router();

// Route to place a new order
router.post('/', orderController.placeOrder); // POST to /api/orders

// Route to get all orders for a user
router.get('/', orderController.getOrders); // GET to /api/orders?userEmail=...

// Route to get a single order detail by ID
router.get('/:orderId', orderController.getOrderDetail); // GET to /api/orders/:orderId

// Route to update order progress (e.g., mark as delivered/completed)
router.patch('/:orderId/progress', orderController.updateOrderProgress); // PATCH to /api/orders/:orderId/progress

export default router;
