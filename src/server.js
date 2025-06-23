import express from "express";
import { ENV } from "./config/env.js";
import { db } from "./config/db.js";
import { ordersTable, menuTable } from "./db/schema.js";
// Make sure to import 'ilike' and 'or' for case-insensitive search and logical OR
import { and, eq, ilike, or } from "drizzle-orm"; // Corrected import
import job from "./config/cron.js";
import cors from 'cors';

const app = express();
const PORT = ENV.PORT || 5001;

if (ENV.NODE_ENV === "production") job.start();

app.use(express.json());
app.use(cors());

app.get("/api/health", (req, res) => {
    res.status(200).json({success:true});
});

// --- MENU ENDPOINTS ---

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
        // Ensure you're comparing against the correct column (e.g., item_id which is likely your primary key for menu items)
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

// --- NEW ENDPOINT: GET menu items by category ---
// This handles requests like /api/menu/category/beverages
app.get("/api/menu/category/:categoryName", async (req, res) => {
    try {
        const { categoryName } = req.params;
        const itemsByCategory = await db.select()
            .from(menuTable)
            .where(eq(menuTable.category, categoryName)); // Assuming 'category' is a column in your menuTable

        if (itemsByCategory.length > 0) {
            res.status(200).json(itemsByCategory);
        } else {
            // It's okay to return an empty array with 200 status if no items found for a category
            res.status(200).json([]);
        }
    } catch (error) {
        console.error("Error fetching menu items by category:", error);
        res.status(500).json({ error: "Something went wrong fetching categorized menu items" });
    }
});

// --- CORRECTED ENDPOINT: GET search menu items ---
// This handles requests like /api/search-menu?query=coffee&category=beverages
app.get("/api/search-menu", async (req, res) => {
    try {
        const { query, category } = req.query; // Get query and optional category from URL parameters

        // Basic validation: ensure query exists and is not empty after trimming whitespace
        if (!query || typeof query !== 'string' || query.trim() === '') {
            return res.status(400).json({ error: "Search query is required and cannot be empty" });
        }

        // Initialize an array to hold all conditions
        const conditions = [];

        // Condition for searching by name or description (case-insensitive using ilike)
        conditions.push(
            or(
                ilike(menuTable.name, `%${query.trim()}%`), // Trim whitespace from query
                ilike(menuTable.description, `%${query.trim()}%`) // Trim whitespace from query
            )
        );

        // If a category is provided (and it's not 'all'), add it to conditions
        if (category && category !== 'all') {
            conditions.push(eq(menuTable.category, category));
        }

        // Execute the query: use 'and' to combine all conditions in the array
        const searchResults = await db.select()
            .from(menuTable)
            .where(and(...conditions)); // Spread the 'conditions' array into the 'and' function

        res.status(200).json(searchResults);

    } catch (error) {
        // Log the full error to the console for debugging
        console.error("Error searching menu items:", error);
        res.status(500).json({ error: "Something went wrong with the search on the server." });
    }
});
// --- END CORRECTED MENU ENDPOINTS ---


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