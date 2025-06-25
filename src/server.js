// backend/src/server.js (UPDATED - Adjust Order Routes Middleware)
import express from "express";
import { ENV } from "./config/env.js"; 
import { db } from "./config/db.js"; 
import { and, eq, ilike, or } from "drizzle-orm"; 
import job from "./config/cron.js"; 
import cors from 'cors';

import userRoutes from './routes/userRoutes.js'; 
import orderRoutes from './routes/orderRoutes.js'; 
import menuRoutes from './routes/menuRoutes.js'; 

const app = express();
const PORT = ENV.PORT || 5001; 

if (ENV.NODE_ENV === "production") job.start(); 

app.use(express.json()); 
app.use(cors()); 

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true });
});

app.use('/api/user', userRoutes); 
app.use('/api/orders', orderRoutes); // This now handles /api/orders/user, /api/orders/status, etc.
app.use('/api/menu', menuRoutes);   

// General error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
