// backend/src/controllers/menuController.js (NEW FILE)
import { db } from '../config/db.js';
import { menuTable } from '../db/schema.js'; // Import menuTable from your schema
import { eq, ilike, or, and } from 'drizzle-orm';

const menuController = {
  // GET all menu items
  getAllMenuItems: async (req, res) => {
    try {
      const menuItems = await db.select().from(menuTable);
      res.status(200).json(menuItems);
    } catch (error) {
      console.error("Error fetching all menu items:", error);
      res.status(500).json({ error: "Something went wrong fetching menu" });
    }
  },

  // GET a single menu item by ID
  getMenuItemById: async (req, res) => {
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
  },

  // GET menu items by category
  getMenuItemsByCategory: async (req, res) => {
    try {
      const { categoryName } = req.params;
      const itemsByCategory = await db.select()
        .from(menuTable)
        .where(eq(menuTable.category, categoryName));

      if (itemsByCategory.length > 0) {
        res.status(200).json(itemsByCategory);
      } else {
        res.status(200).json([]); // Return empty array if no items found for category
      }
    } catch (error) {
      console.error("Error fetching menu items by category:", error);
      res.status(500).json({ error: "Something went wrong fetching categorized menu items" });
    }
  },

  // GET search menu items
  searchMenuItems: async (req, res) => {
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
  }
};

export default menuController;
