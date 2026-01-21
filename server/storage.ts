
import fs from "fs/promises";
import path from "path";
import { Product, Order } from "@shared/schema";
import { randomUUID } from "crypto";

const DATA_FILE = path.join(process.cwd(), "data.json");

interface Data {
  products: Product[];
  orders: Order[];
}

const INITIAL_DATA: Data = {
  products: [
    { id: "1", name: "NOIR MESH TEE", description: "Architectural mesh construction with raw hem detailing.", price: 85.00, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000", category: "TOPS", stock: 50 },
    { id: "2", name: "SCULPTED LINEN TROUSER", description: "High-waisted architectural silhouette in heavy Italian linen.", price: 245.00, image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=1000", category: "BOTTOMS", stock: 30 },
    { id: "3", name: "MONO KNIT PULLOVER", description: "Dense-knit recycled cashmere with exaggerated proportions.", price: 320.00, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000", category: "TOPS", stock: 20 },
    { id: "4", name: "STRUCTURED WOOL COAT", description: "Double-faced virgin wool with sharp, precise tailoring.", price: 580.00, image: "https://images.unsplash.com/photo-1539533018447-63fcce6671b3?q=80&w=1000", category: "OUTERWEAR", stock: 15 },
    { id: "5", name: "SILK COLUMN DRESS", description: "Floor-length sand-washed silk with a fluid drape.", price: 450.00, image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000", category: "DRESSES", stock: 25 },
    { id: "6", name: "SELVEDGE DENIM 01", description: "14oz Japanese raw denim, straight-cut classic.", price: 210.00, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1000", category: "BOTTOMS", stock: 40 },
    { id: "7", name: "ARCHIVE TOTE", description: "Heavyweight waxed cotton with industrial hardware.", price: 165.00, image: "https://images.unsplash.com/photo-1544816153-12ad5d7133a2?q=80&w=1000", category: "ACCESSORIES", stock: 60 },
    { id: "8", name: "BRUTALIST BOOT", description: "Polished calfskin with a chunky, geometric sole.", price: 395.00, image: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?q=80&w=1000", category: "SHOES", stock: 12 },
    { id: "9", name: "RIBBED SILK POLO", description: "Technical silk rib with a seamless finish.", price: 185.00, image: "https://images.unsplash.com/photo-1626497748470-281923f99025?q=80&w=1000", category: "TOPS", stock: 35 },
    { id: "10", name: "MODULAR SHORT", description: "Technical nylon with multi-pocket system.", price: 145.00, image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=1000", category: "BOTTOMS", stock: 45 },
    { id: "11", name: "DOWN PUFFER VEST", description: "Hyper-matte shell with premium fill.", price: 295.00, image: "https://images.unsplash.com/photo-1620934508433-4f51457186d1?q=80&w=1000", category: "OUTERWEAR", stock: 18 },
    { id: "12", name: "HEAVY JERSEY TEE", description: "300gsm organic cotton, boxy cropped fit.", price: 95.00, image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1000", category: "TOPS", stock: 55 },
    { id: "13", name: "ASYMMETRIC SKIRT", description: "Geometric construction in technical wool.", price: 265.00, image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=1000", category: "BOTTOMS", stock: 22 },
    { id: "14", name: "PRECISION SHIRT", description: "Laser-cut seams, concealed placket, fine poplin.", price: 195.00, image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000", category: "TOPS", stock: 30 },
    { id: "15", name: "MINIMAL DERBY", description: "Single-piece leather construction, matte finish.", price: 340.00, image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=1000", category: "SHOES", stock: 15 },
    { id: "16", name: "MERINO BALACLAVA", description: "Seamless 3D knit in ultra-fine merino.", price: 110.00, image: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?q=80&w=1000", category: "ACCESSORIES", stock: 80 },
    { id: "17", name: "CARGO PANT V2", description: "Integrated belt system, articulated knees.", price: 285.00, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000", category: "BOTTOMS", stock: 28 },
    { id: "18", name: "DENIM SHELL", description: "Overdyed denim with structural stitching.", price: 310.00, image: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?q=80&w=1000", category: "OUTERWEAR", stock: 20 },
    { id: "19", name: "CONCEPT GRAPHIC", description: "Abstract typography on heavy tech-jersey.", price: 125.00, image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000", category: "TOPS", stock: 40 },
    { id: "20", name: "LINEN OVER-SHIRT", description: "Boxy fit with oversized utilitarian pockets.", price: 225.00, image: "https://images.unsplash.com/photo-1598033129183-c4f50c7176c8?q=80&w=1000", category: "TOPS", stock: 35 }
  ],
  orders: []
};

export interface IStorage {
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: Omit<Product, "id">): Promise<Product>;
  updateProduct(id: string, product: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  createOrder(order: Omit<Order, "id" | "createdAt">): Promise<Order>;
  getOrders(): Promise<Order[]>;
}

export class JsonStorage implements IStorage {
  private async readData(): Promise<Data> {
    try {
      const data = await fs.readFile(DATA_FILE, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      await this.writeData(INITIAL_DATA);
      return INITIAL_DATA;
    }
  }

  private async writeData(data: Data): Promise<void> {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  }

  async getProducts(): Promise<Product[]> {
    const data = await this.readData();
    return data.products;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const data = await this.readData();
    return data.products.find(p => p.id === id);
  }

  async createProduct(product: Omit<Product, "id">): Promise<Product> {
    const data = await this.readData();
    const newProduct: Product = { ...product, id: randomUUID() };
    data.products.push(newProduct);
    await this.writeData(data);
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined> {
    const data = await this.readData();
    const index = data.products.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    const updatedProduct = { ...data.products[index], ...updates };
    data.products[index] = updatedProduct;
    await this.writeData(data);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const data = await this.readData();
    const initialLength = data.products.length;
    data.products = data.products.filter(p => p.id !== id);
    if (data.products.length !== initialLength) {
      await this.writeData(data);
      return true;
    }
    return false;
  }

  async createOrder(orderData: Omit<Order, "id" | "createdAt">): Promise<Order> {
    const data = await this.readData();
    const newOrder: Order = { ...orderData, id: randomUUID(), createdAt: new Date().toISOString() };
    data.orders.push(newOrder);
    await this.writeData(data);
    return newOrder;
  }

  async getOrders(): Promise<Order[]> {
    const data = await this.readData();
    return data.orders;
  }
}

export const storage = new JsonStorage();
