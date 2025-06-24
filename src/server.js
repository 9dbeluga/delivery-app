// backend/src/server.js (UPDATED - MODULARIZED MAIN APP FILE)
import express from "express";
import { ENV } from "./config/env.js"; // Assuming ENV is correctly defined
import { db } from "./config/db.js"; // Import db if needed elsewhere, though not directly for routes now
// Removed direct imports for schema tables as they are used within controllers
// import { orders, menuTable, users } from "./db/schema.js"; 
import { and, eq, ilike, or } from "drizzle-orm"; // Still needed for middleware/direct queries if any, or can be moved to controllers
import job from "./config/cron.js"; // Keep your cron job setup
import cors from 'cors';

// Import your modular route files
import userRoutes from './routes/userRoutes.js'; 
import orderRoutes from './routes/orderRoutes.js'; // Ensure this is imported
import menuRoutes from './routes/menuRoutes.js'; // <<< NEW IMPORT: Menu routes

const app = express();
const PORT = ENV.PORT || 5001; 

if (ENV.NODE_ENV === "production") job.start(); // Start cron job in production

app.use(express.json()); // Middleware for parsing JSON bodies
app.use(cors()); // Middleware for CORS

// Basic health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true });
});

// --- MODULARIZED ROUTES ---
// Mount your API routes using the imported routers
app.use('/api/user', userRoutes); // User registration/address
app.use('/api/orders', orderRoutes); // Order placement and fetching
app.use('/api/menu', menuRoutes);   // Menu item fetching and searching

// --- REMOVED: All previous direct menu endpoints ---
// --- REMOVED: All previous direct orders endpoints (POST, GET, DELETE) ---

// General error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
