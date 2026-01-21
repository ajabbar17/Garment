
import { z } from "zod";

// Product Schema
export const productSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0, "Price must be positive"),
  image: z.string().url("Must be a valid URL"),
  category: z.string(),
  stock: z.number().int().min(0).default(10),
});

export type Product = z.infer<typeof productSchema>;

// Cart Item Schema
export const cartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1),
});

export type CartItem = z.infer<typeof cartItemSchema>;

// Order Schema
export const orderSchema = z.object({
  id: z.string(),
  customerName: z.string().min(1),
  email: z.string().email(),
  address: z.string().min(1),
  items: z.array(cartItemSchema),
  total: z.number(),
  createdAt: z.string(),
});

export type Order = z.infer<typeof orderSchema>;

// Admin Login Schema
export const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});
