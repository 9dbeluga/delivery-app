import express from "express";
import { ENV } from "./config/env.js";
import { db } from "./config/db.js";
import { ordersTable } from "./db/schema.js";
import { and, eq } from "drizzle-orm";
import job from "./config/cron.js";



const app = express()
const PORT = ENV.PORT || 5001;

if (ENV.NODE_ENV === "production") job.start()

app.use(express.json())

app.get("/api/health", (req, res) => {
    res.status(200).json({success:true});
});

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

app.get("api/orders/:userId", async(req, res) => {
    try {
        const {userId} = req.params;

        const userOrders = await db.select().from(ordersTable).where(eq(ordersTable.userId,userId))

        res.status(200).json(userOrders)
        
    } catch (error) {
         console.log("Error fetching Order", error)
        res.status(500).json({error:"Something went wrong"})
    }
})

app.delete("api/orders/:userId/:descriptionId", async(req, res) => {
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

app.listen(5001, () => {
    console.log("Server is runnning on PORT:", PORT);
});