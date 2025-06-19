import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const ordersTable = pgTable("orders", {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    descriptionId: integer("description_id").notNull(),
    title: text("title").notNull(),
    image: text("image"),
    price: text("price"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});