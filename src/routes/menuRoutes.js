// backend/src/routes/menuRoutes.js (NEW FILE)
import { Router } from 'express';
import menuController from '../controllers/menuController.js';

const router = Router();

// GET all menu items
router.get('/', menuController.getAllMenuItems);

// GET a single menu item by ID
router.get('/:id', menuController.getMenuItemById);

// GET menu items by category
router.get('/category/:categoryName', menuController.getMenuItemsByCategory);

// GET search menu items (requires a query parameter for search term)
router.get('/search', menuController.searchMenuItems); // Note: changed to /search to avoid conflict with /:id

export default router;
