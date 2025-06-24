// backend/src/server.js (UPDATED FILE)
import express from "express";
import { ENV } from "./config/env.js";
import { db } from "./config/db.js";
import { ordersTable, menuTable, users } from "./db/schema.js"; // <--- ADD 'users' import here
import { and, eq, ilike, or } from "drizzle-orm";
import job from "./config/cron.js";
import cors from 'cors';

// Import your new user routes
import userRoutes from './routes/userRoutes.js'; // <--- ADD this import

const app = express();
const PORT = ENV.PORT || 5001; // Your current port is 5001

if (ENV.NODE_ENV === "production") job.start();

app.use(express.json());
app.use(cors());

app.get("/api/health", (req, res) => {
    res.status(200).json({success:true});
});

// --- Use your new user routes ---
// All requests to /api/user/... will be handled by userRoutes
app.use('/api/user', userRoutes); // <--- ADD this middleware

// --- MENU ENDPOINTS ---
// (Your existing menu endpoints remain unchanged)
// GET all menu items
app.get("/api/menu", async (req, res) => {
    try {
        const menuItems = await db.select().from(menuTable);
        res.status(200).json(menuItems);
    } catch (error) {
        console.error("Error fetching all menu items:", error);
        res.status(500).json({ error: "Something went wrong fetching menu" });
    }
});

// GET a single menu item by ID
app.get("/api/menu/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const menuItem = await db.select().from(menuTable).where(eq(menuTable.item_id, id));

        if (menuItem.length > 0) {
            res.status(200).json(menuItem[0]);
        } else {
            res.status(404).json({ error: "Menu item not found" });
        }
    } catch (error) {
        console.error("Error fetching menu item by ID:", error);
        res.status(500).json({ error: "Something went wrong fetching menu item" });
    }
});

// GET menu items by category
app.get("/api/menu/category/:categoryName", async (req, res) => {
    try {
        const { categoryName } = req.params;
        const itemsByCategory = await db.select()
            .from(menuTable)
            .where(eq(menuTable.category, categoryName));

        if (itemsByCategory.length > 0) {
            res.status(200).json(itemsByCategory);
        } else {
            res.status(200).json([]);
        }
    } catch (error) {
        console.error("Error fetching menu items by category:", error);
        res.status(500).json({ error: "Something went wrong fetching categorized menu items" });
    }
});

// GET search menu items
app.get("/api/search-menu", async (req, res) => {
    try {
        const { query, category } = req.query;

        if (!query || typeof query !== 'string' || query.trim() === '') {
            return res.status(400).json({ error: "Search query is required and cannot be empty" });
        }

        const conditions = [];
        conditions.push(
            or(
                ilike(menuTable.name, `%${query.trim()}%`),
                ilike(menuTable.description, `%${query.trim()}%`)
            )
        );

        if (category && category !== 'all') {
            conditions.push(eq(menuTable.category, category));
        }

        const searchResults = await db.select()
            .from(menuTable)
            .where(and(...conditions));

        res.status(200).json(searchResults);

    } catch (error) {
        console.error("Error searching menu items:", error);
        res.status(500).json({ error: "Something went wrong with the search on the server." });
    }
});
// --- END MENU ENDPOINTS ---


app.post("/api/orders", async (req, res) => {
    try {
        const { userId, descriptionId, title, image, price } = req.body;

        if(!userId || !descriptionId || !title) {
            return res.status(400).json({ error: "Missing required fields"});
        }
        const newOrders = await db
            .insert(ordersTable)
            .values({
            userId,
            descriptionId,
            title,
            image,
            price,
        }).returning();

        res.status(201).json(newOrders[0]);

    } catch (error) {
        console.log("Error processing Order", error);
        res.status(500).json({error:"Something went wrong"});
    }
});

app.get("/api/orders/:userId", async(req, res) => {
    try {
        const {userId} = req.params;

        const userOrders = await db.select().from(ordersTable).where(eq(ordersTable.userId,userId));

        res.status(200).json(userOrders);

    } catch (error) {
        console.log("Error fetching Order", error);
        res.status(500).json({error:"Something went wrong"});
    }
});

app.delete("/api/orders/:userId/:descriptionId", async(req, res) => {
    try {
        const { userId, descriptionId } = req.params;

        await db.delete(ordersTable).where(
            and(eq(ordersTable.userId, userId), eq(ordersTable.descriptionId, parseInt(descriptionId)))
        );

        res.status(200).json({ message: "Order Canceled Successfully" });

    } catch (error) {
        console.log("Error canceling Order", error);
        res.status(500).json({error:"Something went wrong"});
    }
});

app.listen(PORT, () => {
    console.log("Server is running on PORT:", PORT);
});