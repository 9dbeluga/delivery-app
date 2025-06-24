// backend/src/db/schema.js (Update this file)
import { pgTable, serial, timestamp, integer, uuid, varchar, numeric, text, boolean, uniqueIndex } from "drizzle-orm/pg-core";

// Your existing ordersTable definition (if present)
export const ordersTable = pgTable("orders", {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    descriptionId: integer("description_id").notNull(),
    title: text("title").notNull(),
    image: text("image"),
    price: text("price"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Your existing menuTable definition (if present)
export const menuTable = pgTable("menu", {
    item_id: uuid("item_id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    description: text("description"),
    image_url: varchar("image_url", { length: 500 }),
    category: text('category'),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
});

// --- NEW: Define your 'users' table for Drizzle ---
// This schema will tell Drizzle how to create and interact with your 'users' table
export const users = pgTable('users', {
  // `id`: A unique identifier for each user, generated automatically as a UUID.
  id: uuid('id').defaultRandom().primaryKey(), 
  
  // `email`: The user's email address, which must be unique and not null. 
  // This will be used to identify and update user records.
  email: text('email').notNull().unique(),      
  
  // Address fields: These correspond to the input fields on your mobile app's address form.
  street: text('street'),                       // Street address (e.g., "123 Rue de la Victoire")
  city: text('city'),                           // City (e.g., "Kinshasa")
  apartment: text('apartment'),                 // Optional: apartment number or name
  extraInfo: text('extra_info'),                // Optional: additional delivery instructions

  // Fixed location fields: Set to default values as requested for Kinshasa.
  province: text('province').default('Kinshasa').notNull(),
  country: text('country').default('Democratic Republic of Congo').notNull(),

  // Timestamps for tracking when the record was created and last updated.
  createdAt: timestamp('created_at').defaultNow().notNull(), 
  // `$onUpdate(() => new Date())` ensures `updatedAt` is automatically set to the current time on update.
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(), 
}, (table) => {
  return {
    // `emailIdx`: A unique index on the `email` column for faster lookups and to enforce uniqueness.
    emailIdx: uniqueIndex('email_idx').on(table.email), 
  };
});