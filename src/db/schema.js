import { pgTable, serial, timestamp, integer, uuid, varchar, numeric, text, boolean } from "drizzle-orm/pg-core";

export const ordersTable = pgTable("orders", {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    descriptionId: integer("description_id").notNull(),
    title: text("title").notNull(),
    image: text("image"),
    price: text("price"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
// db/schema.js (Existing file)
// ... (your existing imports for ordersTable, etc.)

// Assuming you have `ordersTable` defined here already:
// export const ordersTable = pgTable(...)

// Define your menuTable
export const menuTable = pgTable("menu", { // "menu" should match your table name in Neon
  item_id: uuid("item_id").primaryKey().defaultRandom(), // Use .defaultRandom() for gen_random_uuid()
  name: varchar("name", { length: 255 }).notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(), // Precision/scale match your DB setup
  description: text("description"), // No .notNull() if it's optional
  image_url: varchar("image_url", { length: 500 }), // No .notNull() if it's optional
  // You might want to add created_at and updated_at for tracking:
  category: text('category'),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});