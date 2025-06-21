import express from "express";
import { ENV } from "./config/env.js";
import { db } from "./config/db.js";
import { ordersTable, menuTable } from "./db/schema.js"; // <--- Import menuTable
import { and, eq } from "drizzle-orm";
import job from "./config/cron.js";
import cors from 'cors'; // <--- Import cors for cross-origin requests from your Expo app


const app = express()
const PORT = ENV.PORT || 5001;

if (ENV.NODE_ENV === "production") job.start()

app.use(express.json())
app.use(cors()); // <--- Add this line to enable CORS

app.get("/api/health", (req, res) => {
    res.status(200).json({success:true});
});

// --- NEW MENU ENDPOINTS ---

// GET all menu items
app.get("/api/menu", async (req, res) => {
    try {
        const menuItems = await db.select().from(menuTable); // Select all from menuTable
        res.status(200).json(menuItems);
    } catch (error) {
        console.error("Error fetching menu items:", error);
        res.status(500).json({ error: "Something went wrong fetching menu" });
    }
});

// GET a single menu item by ID
app.get("/api/menu/:id", async (req, res) => {
    try {
        const { id } = req.params;
        // Use .where(eq(menuTable.item_id, id)) to filter by the item_id
        const menuItem = await db.select().from(menuTable).where(eq(menuTable.item_id, id));

        if (menuItem.length > 0) {
            res.status(200).json(menuItem[0]); // Return the first item found
        } else {
            res.status(404).json({ error: "Menu item not found" });
        }
    } catch (error) {
        console.error("Error fetching menu item by ID:", error);
        res.status(500).json({ error: "Something went wrong fetching menu item" });
    }
});

// --- END NEW MENU ENDPOINTS ---


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

        res.status(201).json(newOrders[0])

    } catch (error) {
        console.log("Error processing Order", error)
        res.status(500).json({error:"Something went wrong"})
    }
});

app.get("/api/orders/:userId", async(req, res) => { // Fix leading slash
    try {
        const {userId} = req.params;

        const userOrders = await db.select().from(ordersTable).where(eq(ordersTable.userId,userId))

        res.status(200).json(userOrders)
        
    } catch (error) {
        console.log("Error fetching Order", error)
        res.status(500).json({error:"Something went wrong"})
    }
})

app.delete("/api/orders/:userId/:descriptionId", async(req, res) => { // Fix leading slash
    try {
        const { userId, descriptionId } = req.params

        await db.delete(ordersTable).where(
            and(eq(ordersTable.userId, userId), eq(ordersTable.descriptionId, parseInt(descriptionId)))
        );

        res.status(200).json({ message: "Order Canceled Successfully" });
        
    } catch (error) {
        console.log("Error canceling Order", error)
        res.status(500).json({error:"Something went wrong"})
    }
})

app.listen(PORT, () => { // Use the PORT constant here
    console.log("Server is runnning on PORT:", PORT);
});