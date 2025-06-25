// backend/src/routes/orderRoutes.js (UPDATED - Expose New Endpoint)
import { Router } from 'express';
import orderController from '../controllers/orderController.js';

const router = Router();

// Route to place a new order (customer app)
router.post('/', orderController.placeOrder); 

// Route to get all orders for a user (customer app)
router.get('/user', orderController.getOrders); // Changed from '/' to '/user' to avoid conflict with general get

// NEW: Route to get orders filtered by inProgress status (driver/admin app)
router.get('/status', orderController.getOrdersByProgress); // GET to /api/orders/status?inProgress=true/false

// Route to get a single order detail by ID (must be after more specific GETs)
router.get('/:orderId', orderController.getOrderDetail); 

// Route to update order progress (e.g., mark as delivered/completed)
router.patch('/:orderId/progress', orderController.updateOrderProgress); 

export default router;
