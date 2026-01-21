
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { productSchema, loginSchema, orderSchema } from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";

const SessionStore = MemoryStore(session);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Middleware for sessions (Cart & Admin Auth)
  app.use(session({
    secret: 'academic-secret-key',
    resave: false,
    saveUninitialized: true,
    store: new SessionStore({ checkPeriod: 86400000 }),
    cookie: { secure: process.env.NODE_ENV === "production" }
  }));

  // --- API Routes ---

  // Get all products
  app.get("/api/products", async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  // Get product by ID
  app.get("/api/products/:id", async (req, res) => {
    const product = await storage.getProduct(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  });

  // Admin Login
  app.post("/api/admin/login", (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      // Dummy admin credentials
      if (username === "admin" && password === "admin123") {
        (req.session as any).isAdmin = true;
        return res.json({ message: "Login successful" });
      }
      res.status(401).json({ message: "Invalid credentials" });
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post("/api/admin/logout", (req, res) => {
    (req.session as any).isAdmin = false;
    res.json({ message: "Logged out" });
  });

  app.get("/api/admin/check", (req, res) => {
    res.json({ isAdmin: !!(req.session as any).isAdmin });
  });

  // Middleware to check admin status
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.session.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    next();
  };

  // Create Product (Admin only)
  app.post("/api/products", requireAdmin, async (req, res) => {
    try {
      const productData = productSchema.omit({ id: true }).parse(req.body);
      const newProduct = await storage.createProduct(productData);
      res.status(201).json(newProduct);
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ message: e.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  // Update Product (Admin only)
  app.put("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      const productData = productSchema.partial().parse(req.body);
      const updated = await storage.updateProduct(req.params.id, productData);
      if (!updated) return res.status(404).json({ message: "Product not found" });
      res.json(updated);
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ message: e.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  // Delete Product (Admin only)
  app.delete("/api/products/:id", requireAdmin, async (req, res) => {
    const success = await storage.deleteProduct(req.params.id);
    if (!success) return res.status(404).json({ message: "Product not found" });
    res.status(204).send();
  });

  // --- Cart Routes (Session based) ---

  app.get("/api/cart", (req, res) => {
    const cart = (req.session as any).cart || [];
    res.json(cart);
  });

  app.post("/api/cart", (req, res) => {
    const { productId, quantity } = req.body;
    if (!productId || !quantity) return res.status(400).json({ message: "Missing fields" });

    const cart = (req.session as any).cart || [];
    const existingItem = cart.find((item: any) => item.productId === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ productId, quantity });
    }

    (req.session as any).cart = cart;
    res.json(cart);
  });

  app.put("/api/cart/:productId", (req, res) => {
    const { quantity } = req.body;
    const cart = (req.session as any).cart || [];
    const item = cart.find((item: any) => item.productId === req.params.productId);

    if (item) {
      item.quantity = quantity;
      if (item.quantity <= 0) {
         (req.session as any).cart = cart.filter((i: any) => i.productId !== req.params.productId);
      }
    }
    
    res.json((req.session as any).cart);
  });

  app.delete("/api/cart/:productId", (req, res) => {
    const cart = (req.session as any).cart || [];
    (req.session as any).cart = cart.filter((item: any) => item.productId !== req.params.productId);
    res.json((req.session as any).cart);
  });

  // --- Orders ---

  app.post("/api/orders", async (req, res) => {
    try {
      // In a real app, we'd validate items against the DB prices
      const orderData = orderSchema.omit({ id: true, createdAt: true }).parse(req.body);
      const newOrder = await storage.createOrder(orderData);
      
      // Clear cart
      (req.session as any).cart = [];
      
      res.status(201).json(newOrder);
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ message: e.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/orders", requireAdmin, async (req, res) => {
    const orders = await storage.getOrders();
    res.json(orders);
  });

  return httpServer;
}
