        // backend/src/db/schema.js (FULLY MERGED & CORRECTED - RECONFIRM THIS IS WHAT YOU HAVE)
        import { pgTable, text, timestamp, serial, numeric, uuid, jsonb, boolean, varchar, uniqueIndex } from 'drizzle-orm/pg-core'; 
        // Ensure all necessary types are imported: uuid, jsonb, boolean, varchar, uniqueIndex, serial, text, timestamp, numeric

        // Existing 'users' table definition
        export const users = pgTable('users', {
          id: uuid('id').defaultRandom().primaryKey(), 
          email: text('email').notNull().unique(),      
          street: text('street'),                       
          city: text('city'),                           
          apartment: text('apartment'),                 
          extraInfo: text('extra_info'),                
          province: text('province').default('Kinshasa').notNull(),
          country: text('country').default('Democratic Republic of Congo').notNull(),
          createdAt: timestamp('created_at').defaultNow().notNull(), 
          updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(), 
        }, (table) => {
          return {
            emailIdx: uniqueIndex('email_idx').on(table.email), 
          };
        });

        // Your 'menuTable' definition
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


        // The NEW, CORRECTED 'orders' table
        export const orders = pgTable('orders', { 
          id: uuid('id').primaryKey().defaultRandom(), 
          userEmail: text('user_email').notNull(),
          
          items: jsonb('items').notNull().$type(), 
          
          totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
          orderDate: timestamp('order_date').defaultNow().notNull(),
          
          inProgress: boolean('in_progress').default(true).notNull(), 

          deliveryAddressStreet: text('delivery_address_street').notNull(),
          deliveryAddressCity: text('delivery_address_city').notNull(),
          deliveryAddressApartment: text('delivery_address_apartment'),
          deliveryAddressExtraInfo: text('delivery_address_extra_info'),
          deliveryAddressProvince: text('delivery_address_province').default('Kinshasa').notNull(),
          country: text('country').default('Democratic Republic of Congo').notNull(), 
          updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
        });
        