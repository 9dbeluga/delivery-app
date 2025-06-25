// backend/src/controllers/orderController.js (UPDATED - Add getOrdersByProgress)
import { db } from '../config/db.js';
import { orders, users } from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';

const orderController = {
  // Place a new order
  placeOrder: async (req, res) => {
    const { userEmail, cartItems, totalAmount } = req.body;

    if (!userEmail || !cartItems || !Array.isArray(cartItems) || cartItems.length === 0 || !totalAmount) {
      return res.status(400).json({ error: 'Missing required order details: userEmail, cartItems, totalAmount.' });
    }

    try {
      const userAddress = await db.select()
        .from(users)
        .where(eq(users.email, userEmail))
        .limit(1);

      if (userAddress.length === 0 || !userAddress[0].street || !userAddress[0].city) {
        return res.status(400).json({ error: 'User address not found. Please set your delivery address before placing an order.' });
      }

      const address = userAddress[0];

      const newOrder = await db.insert(orders)
        .values({
          userEmail,
          items: cartItems,
          totalAmount: totalAmount.toString(),
          orderDate: new Date(),
          inProgress: true, // Default to true for new orders
          deliveryAddressStreet: address.street,
          deliveryAddressCity: address.city,
          deliveryAddressApartment: address.apartment,
          deliveryAddressExtraInfo: address.extraInfo,
          deliveryAddressProvince: address.province,
          deliveryAddressCountry: address.country,
          updatedAt: new Date(),
        })
        .returning();

      const orderId = newOrder[0].id;
      console.log('Order placed successfully:', newOrder[0]);
      res.status(201).json({ message: 'Order placed successfully!', orderId: orderId, order: newOrder[0] });

    } catch (error) {
      console.error('Error placing order:', error);
      res.status(500).json({ error: 'Failed to place order due to a server error.', details: error.message });
    }
  },

  // Get orders for a specific user (customer-facing)
  getOrders: async (req, res) => {
    const { userEmail } = req.query;

    if (!userEmail) {
      return res.status(400).json({ error: 'User email is required to fetch orders.' });
    }

    try {
      const userOrders = await db.select()
        .from(orders)
        .where(eq(orders.userEmail, userEmail))
        .orderBy(desc(orders.orderDate));

      console.log(`Fetched ${userOrders.length} orders for ${userEmail}.`);
      res.status(200).json(userOrders);

    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders due to a server error.', details: error.message });
    }
  },

  // NEW: Get orders filtered by inProgress status (for driver/admin app)
  getOrdersByProgress: async (req, res) => {
    const { inProgress } = req.query; // Expect 'true' or 'false' as string

    if (inProgress === undefined) {
      return res.status(400).json({ error: 'inProgress query parameter (true/false) is required.' });
    }

    const inProgressBoolean = inProgress === 'true'; // Convert string 'true'/'false' to boolean

    try {
      const filteredOrders = await db.select()
        .from(orders)
        .where(eq(orders.inProgress, inProgressBoolean))
        .orderBy(desc(orders.orderDate));

      console.log(`Fetched ${filteredOrders.length} orders with inProgress = ${inProgressBoolean}.`);
      res.status(200).json(filteredOrders);

    } catch (error) {
      console.error('Error fetching orders by progress:', error);
      res.status(500).json({ error: 'Failed to fetch orders by progress due to a server error.', details: error.message });
    }
  },


  // Get a single order by ID
  getOrderDetail: async (req, res) => {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required.' });
    }

    try {
      const orderDetail = await db.select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1);

      if (orderDetail.length === 0) {
        return res.status(404).json({ message: 'Order not found.' });
      }

      res.status(200).json(orderDetail[0]);

    } catch (error) {
      console.error('Error fetching order detail:', error);
      res.status(500).json({ error: 'Failed to fetch order detail due to a server error.', details: error.message });
    }
  },

  // Update order status (e.g., mark as delivered)
  updateOrderProgress: async (req, res) => {
    const { orderId } = req.params;
    const { inProgress } = req.body;

    if (!orderId || typeof inProgress !== 'boolean') {
      return res.status(400).json({ error: 'Order ID and a boolean inProgress status are required.' });
    }

    try {
      const updatedOrder = await db.update(orders)
        .set({ inProgress: inProgress, updatedAt: new Date() })
        .where(eq(orders.id, orderId))
        .returning();

      if (updatedOrder.length === 0) {
        return res.status(404).json({ message: 'Order not found.' });
      }

      console.log('Order progress updated:', updatedOrder[0]);
      res.status(200).json({ message: 'Order progress updated successfully!', order: updatedOrder[0] });

    } catch (error) {
      console.error('Error updating order progress:', error);
      res.status(500).json({ error: 'Failed to update order progress due to a server error.', details: error.message });
    }
  }
};

export default orderController;
