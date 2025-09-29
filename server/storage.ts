import dotenv from "dotenv";
dotenv.config();

import { type User, type InsertUser, type MenuItem, type InsertMenuItem, type Transaction, type InsertTransaction, type DailySummary, type InsertDailySummary, type WeeklySummary, type InsertWeeklySummary, type MonthlySummary, type InsertMonthlySummary } from "@shared/schema";
import { randomUUID } from "crypto";
import { MongoStorage } from "./db/mongodb";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Menu Items
  getMenuItems(): Promise<MenuItem[]>;
  getMenuItem(id: string): Promise<MenuItem | undefined>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: string, item: Partial<MenuItem>): Promise<MenuItem | undefined>;

  // Transactions
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactions(limit?: number): Promise<Transaction[]>;
  getTransactionsByDate(date: string): Promise<Transaction[]>;
  getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]>;

  // Daily Summaries
  createDailySummary(summary: InsertDailySummary): Promise<DailySummary>;
  getDailySummary(date: string): Promise<DailySummary | undefined>;
  getDailySummaries(limit?: number): Promise<DailySummary[]>;

  // Weekly Summaries
  createWeeklySummary(summary: InsertWeeklySummary): Promise<WeeklySummary>;
  getWeeklySummary(weekStart: string): Promise<WeeklySummary | undefined>;
  getWeeklySummaries(limit?: number): Promise<WeeklySummary[]>;

  // Monthly Summaries
  createMonthlySummary(summary: InsertMonthlySummary): Promise<MonthlySummary>;
  getMonthlySummary(month: string): Promise<MonthlySummary | undefined>;
  getMonthlySummaries(limit?: number): Promise<MonthlySummary[]>;

  // Clear data methods
  clearDataByDay(date: string): Promise<void>;
  clearDataByWeek(weekStart: string): Promise<void>;
  clearDataByMonth(month: string): Promise<void>;

  // MongoDB connection methods
  connect?(): Promise<void>;
  disconnect?(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private menuItems: Map<string, MenuItem>;
  private transactions: Map<string, Transaction>;
  private dailySummaries: Map<string, DailySummary>;
  private weeklySummaries: Map<string, WeeklySummary>;
  private monthlySummaries: Map<string, MonthlySummary>;

  constructor() {
    this.users = new Map();
    this.menuItems = new Map();
    this.transactions = new Map();
    this.dailySummaries = new Map();
    this.weeklySummaries = new Map();
    this.monthlySummaries = new Map();

    // Initialize default users
    this.createUser({ username: "Inowara", password: "Inowara@2025" }); // Admin user
    this.createUser({ username: "Chai-fi", password: "Chai-fi@2025" }); // Regular user

    // Initialize menu items
    this.initializeMenuItems();
  }

  private async initializeMenuItems() {
    const defaultItems: InsertMenuItem[] = [
      {
        name: "Masala Chai",
        description: "Traditional spiced tea",
        price: "25.00",
        category: "Tea",
        image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        available: true,
      },
      {
        name: "Green Tea",
        description: "Healthy herbal tea",
        price: "30.00",
        category: "Tea",
        image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        available: true,
      },
      {
        name: "Cappuccino",
        description: "Rich coffee with foam",
        price: "80.00",
        category: "Coffee",
        image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        available: true,
      },
      {
        name: "Black Coffee",
        description: "Strong black coffee",
        price: "50.00",
        category: "Coffee",
        image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        available: true,
      },
      {
        name: "Samosa",
        description: "Crispy fried snack",
        price: "20.00",
        category: "Snacks",
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        available: true,
      },
      {
        name: "Veg Sandwich",
        description: "Fresh vegetable sandwich",
        price: "60.00",
        category: "Snacks",
        image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        available: true,
      },
      {
        name: "Orange Juice",
        description: "Fresh squeezed orange",
        price: "40.00",
        category: "Beverages",
        image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        available: true,
      },
      {
        name: "Mango Lassi",
        description: "Sweet yogurt drink",
        price: "45.00",
        category: "Beverages",
        image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        available: true,
      },
    ];

    for (const item of defaultItems) {
      await this.createMenuItem(item);
    }
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Menu Items
  async getMenuItems(): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values());
  }

  async getMenuItem(id: string): Promise<MenuItem | undefined> {
    return this.menuItems.get(id);
  }

  async createMenuItem(insertItem: InsertMenuItem): Promise<MenuItem> {
    const id = randomUUID();
    const item: MenuItem = { ...insertItem, id };
    this.menuItems.set(id, item);
    return item;
  }

  async updateMenuItem(id: string, updateData: Partial<MenuItem>): Promise<MenuItem | undefined> {
    const existing = this.menuItems.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateData };
    this.menuItems.set(id, updated);
    return updated;
  }

  // Transactions
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const now = new Date();
    const transaction: Transaction = { 
      ...insertTransaction, 
      id,
      createdAt: now,
      billerName: insertTransaction.billerName || 'Sriram',
      extras: insertTransaction.extras || null,
      splitPayment: insertTransaction.splitPayment || null,
      creditor: insertTransaction.creditor || null
    };
    this.transactions.set(id, transaction);

    // Update summaries
    await this.updateSummaries(transaction);

    return transaction;
  }

  async getTransactions(limit?: number): Promise<Transaction[]> {
    const transactions = Array.from(this.transactions.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return limit ? transactions.slice(0, limit) : transactions;
  }

  async getTransactionsByDate(date: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(t => t.date === date)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(t => t.date >= startDate && t.date <= endDate)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Daily Summaries
  async createDailySummary(insertSummary: InsertDailySummary): Promise<DailySummary> {
    const id = randomUUID();
    const summary: DailySummary = { 
      ...insertSummary, 
      id,
      createdAt: new Date()
    };
    this.dailySummaries.set(insertSummary.date, summary);
    return summary;
  }

  async getDailySummary(date: string): Promise<DailySummary | undefined> {
    return this.dailySummaries.get(date);
  }

  async getDailySummaries(limit?: number): Promise<DailySummary[]> {
    const summaries = Array.from(this.dailySummaries.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return limit ? summaries.slice(0, limit) : summaries;
  }

  // Weekly Summaries
  async createWeeklySummary(insertSummary: InsertWeeklySummary): Promise<WeeklySummary> {
    const id = randomUUID();
    const summary: WeeklySummary = { 
      ...insertSummary, 
      id,
      createdAt: new Date()
    };
    this.weeklySummaries.set(insertSummary.weekStart, summary);
    return summary;
  }

  async getWeeklySummary(weekStart: string): Promise<WeeklySummary | undefined> {
    return this.weeklySummaries.get(weekStart);
  }

  async getWeeklySummaries(limit?: number): Promise<WeeklySummary[]> {
    const summaries = Array.from(this.weeklySummaries.values())
      .sort((a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime());
    
    return limit ? summaries.slice(0, limit) : summaries;
  }

  // Monthly Summaries
  async createMonthlySummary(insertSummary: InsertMonthlySummary): Promise<MonthlySummary> {
    const id = randomUUID();
    const summary: MonthlySummary = { 
      ...insertSummary, 
      id,
      createdAt: new Date()
    };
    this.monthlySummaries.set(insertSummary.month, summary);
    return summary;
  }

  async getMonthlySummary(month: string): Promise<MonthlySummary | undefined> {
    return this.monthlySummaries.get(month);
  }

  async getMonthlySummaries(limit?: number): Promise<MonthlySummary[]> {
    const summaries = Array.from(this.monthlySummaries.values())
      .sort((a, b) => new Date(b.month + '-01').getTime() - new Date(a.month + '-01').getTime());
    
    return limit ? summaries.slice(0, limit) : summaries;
  }

  private async updateSummaries(transaction: Transaction) {
    let gpayAmount = 0;
    let cashAmount = 0;

    if (transaction.paymentMethod === 'gpay') {
      gpayAmount = parseFloat(transaction.totalAmount);
    } else if (transaction.paymentMethod === 'cash') {
      cashAmount = parseFloat(transaction.totalAmount);
    } else if (transaction.paymentMethod === 'split' && transaction.splitPayment) {
      const splitData = transaction.splitPayment as any;
      gpayAmount = splitData.gpayAmount || 0;
      cashAmount = splitData.cashAmount || 0;
    }

    // Update daily summary
    const existingDaily = await this.getDailySummary(transaction.date);
    if (existingDaily) {
      existingDaily.totalAmount = (parseFloat(existingDaily.totalAmount) + parseFloat(transaction.totalAmount)).toFixed(2);
      existingDaily.gpayAmount = (parseFloat(existingDaily.gpayAmount) + gpayAmount).toFixed(2);
      existingDaily.cashAmount = (parseFloat(existingDaily.cashAmount) + cashAmount).toFixed(2);
      existingDaily.orderCount += 1;
      this.dailySummaries.set(transaction.date, existingDaily);
    } else {
      await this.createDailySummary({
        date: transaction.date,
        totalAmount: transaction.totalAmount,
        gpayAmount: gpayAmount.toFixed(2),
        cashAmount: cashAmount.toFixed(2),
        orderCount: 1,
      });
    }

    // Update weekly summary
    const weekStart = this.getWeekStart(new Date(transaction.date));
    const weekEnd = this.getWeekEnd(new Date(transaction.date));
    const existingWeekly = await this.getWeeklySummary(weekStart);
    if (existingWeekly) {
      existingWeekly.totalAmount = (parseFloat(existingWeekly.totalAmount) + parseFloat(transaction.totalAmount)).toFixed(2);
      existingWeekly.gpayAmount = (parseFloat(existingWeekly.gpayAmount) + gpayAmount).toFixed(2);
      existingWeekly.cashAmount = (parseFloat(existingWeekly.cashAmount) + cashAmount).toFixed(2);
      existingWeekly.orderCount += 1;
      this.weeklySummaries.set(weekStart, existingWeekly);
    } else {
      await this.createWeeklySummary({
        weekStart,
        weekEnd,
        totalAmount: transaction.totalAmount,
        gpayAmount: gpayAmount.toFixed(2),
        cashAmount: cashAmount.toFixed(2),
        orderCount: 1,
      });
    }

    // Update monthly summary
    const month = transaction.date.substring(0, 7); // YYYY-MM
    const existingMonthly = await this.getMonthlySummary(month);
    if (existingMonthly) {
      existingMonthly.totalAmount = (parseFloat(existingMonthly.totalAmount) + parseFloat(transaction.totalAmount)).toFixed(2);
      existingMonthly.gpayAmount = (parseFloat(existingMonthly.gpayAmount) + gpayAmount).toFixed(2);
      existingMonthly.cashAmount = (parseFloat(existingMonthly.cashAmount) + cashAmount).toFixed(2);
      existingMonthly.orderCount += 1;
      this.monthlySummaries.set(month, existingMonthly);
    } else {
      await this.createMonthlySummary({
        month,
        totalAmount: transaction.totalAmount,
        gpayAmount: gpayAmount.toFixed(2),
        cashAmount: cashAmount.toFixed(2),
        orderCount: 1,
      });
    }
  }

  private getWeekStart(date: Date): string {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(date.setDate(diff));
    return monday.toISOString().split('T')[0];
  }

  private getWeekEnd(date: Date): string {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? 0 : 7); // Adjust when day is Sunday
    const sunday = new Date(date.setDate(diff));
    return sunday.toISOString().split('T')[0];
  }

  // Clear data methods
  async clearDataByDay(date: string): Promise<void> {
    // Remove transactions for the specific date
    const transactionsToDelete = Array.from(this.transactions.entries())
      .filter(([_, transaction]) => transaction.date === date)
      .map(([id, _]) => id);
    
    transactionsToDelete.forEach(id => this.transactions.delete(id));
    
    // Remove daily summary for the date
    this.dailySummaries.delete(date);
    
    // Update weekly and monthly summaries by recalculating
    await this.recalculateWeeklySummary(date);
    await this.recalculateMonthlySummary(date);
  }

  async clearDataByWeek(weekStart: string): Promise<void> {
    const weekEnd = this.getWeekEnd(new Date(weekStart));
    
    // Remove transactions for the week
    const transactionsToDelete = Array.from(this.transactions.entries())
      .filter(([_, transaction]) => transaction.date >= weekStart && transaction.date <= weekEnd)
      .map(([id, _]) => id);
    
    transactionsToDelete.forEach(id => this.transactions.delete(id));
    
    // Remove daily summaries for the week
    const dailySummariesToDelete = Array.from(this.dailySummaries.entries())
      .filter(([date, _]) => date >= weekStart && date <= weekEnd)
      .map(([date, _]) => date);
    
    dailySummariesToDelete.forEach(date => this.dailySummaries.delete(date));
    
    // Remove weekly summary
    this.weeklySummaries.delete(weekStart);
    
    // Update monthly summary by recalculating
    await this.recalculateMonthlySummary(weekStart);
  }

  async clearDataByMonth(month: string): Promise<void> {
    const startDate = `${month}-01`;
    const endDate = `${month}-31`;
    
    // Remove transactions for the month
    const transactionsToDelete = Array.from(this.transactions.entries())
      .filter(([_, transaction]) => transaction.date.startsWith(month))
      .map(([id, _]) => id);
    
    transactionsToDelete.forEach(id => this.transactions.delete(id));
    
    // Remove daily summaries for the month
    const dailySummariesToDelete = Array.from(this.dailySummaries.entries())
      .filter(([date, _]) => date.startsWith(month))
      .map(([date, _]) => date);
    
    dailySummariesToDelete.forEach(date => this.dailySummaries.delete(date));
    
    // Remove weekly summaries that fall within the month
    const weeklySummariesToDelete = Array.from(this.weeklySummaries.entries())
      .filter(([weekStart, _]) => weekStart.startsWith(month))
      .map(([weekStart, _]) => weekStart);
    
    weeklySummariesToDelete.forEach(weekStart => this.weeklySummaries.delete(weekStart));
    
    // Remove monthly summary
    this.monthlySummaries.delete(month);
  }

  private async recalculateWeeklySummary(date: string): Promise<void> {
    const weekStart = this.getWeekStart(new Date(date));
    const weekEnd = this.getWeekEnd(new Date(date));
    
    const weekTransactions = Array.from(this.transactions.values())
      .filter(t => t.date >= weekStart && t.date <= weekEnd);
    
    if (weekTransactions.length === 0) {
      this.weeklySummaries.delete(weekStart);
      return;
    }
    
    const totalAmount = weekTransactions.reduce((sum, t) => sum + parseFloat(t.totalAmount), 0);
    const gpayAmount = weekTransactions
      .filter(t => t.paymentMethod === 'gpay')
      .reduce((sum, t) => sum + parseFloat(t.totalAmount), 0);
    const cashAmount = weekTransactions
      .filter(t => t.paymentMethod === 'cash')
      .reduce((sum, t) => sum + parseFloat(t.totalAmount), 0);
    
    await this.createWeeklySummary({
      weekStart,
      weekEnd,
      totalAmount: totalAmount.toFixed(2),
      gpayAmount: gpayAmount.toFixed(2),
      cashAmount: cashAmount.toFixed(2),
      orderCount: weekTransactions.length,
    });
  }

  private async recalculateMonthlySummary(date: string): Promise<void> {
    const month = date.substring(0, 7);
    
    const monthTransactions = Array.from(this.transactions.values())
      .filter(t => t.date.startsWith(month));
    
    if (monthTransactions.length === 0) {
      this.monthlySummaries.delete(month);
      return;
    }
    
    const totalAmount = monthTransactions.reduce((sum, t) => sum + parseFloat(t.totalAmount), 0);
    const gpayAmount = monthTransactions
      .filter(t => t.paymentMethod === 'gpay')
      .reduce((sum, t) => sum + parseFloat(t.totalAmount), 0);
    const cashAmount = monthTransactions
      .filter(t => t.paymentMethod === 'cash')
      .reduce((sum, t) => sum + parseFloat(t.totalAmount), 0);
    
    await this.createMonthlySummary({
      month,
      totalAmount: totalAmount.toFixed(2),
      gpayAmount: gpayAmount.toFixed(2),
      cashAmount: cashAmount.toFixed(2),
      orderCount: monthTransactions.length,
    });
  }
}

// MongoDB Storage Implementation
class MongoStorage implements IStorage {
  private connectionString: string;
  private dbName: string;
  private client: any;
  private db: any;
  private isConnected: boolean = false;

  constructor(connectionString: string, dbName: string = 'chai-fi') {
    this.connectionString = connectionString;
    this.dbName = dbName;
  }

  async connect(): Promise<void> {
    try {
      // Import MongoDB at runtime to avoid dependency issues
      const { MongoClient } = await import('mongodb');
      
      this.client = new MongoClient(this.connectionString);
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      this.isConnected = true;
      
      console.log('✅ Connected to MongoDB Atlas');
      await this.initializeDefaultData();
      await this.createIndexes();
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.close();
      this.isConnected = false;
      console.log('Disconnected from MongoDB Atlas');
    }
  }

  private async initializeDefaultData(): Promise<void> {
    // Create default admin user if not exists
    const existingUser = await this.db.collection('users').findOne({ username: "Chai-fi" });
    if (!existingUser) {
      await this.createUser({ username: "Chai-fi", password: "Chai-fi@2025" });
    }

    // Create default menu items if collection is empty
    const menuCount = await this.db.collection('menu_items').countDocuments();
    if (menuCount === 0) {
      await this.initializeMenuItems();
    }
  }

  private async createIndexes(): Promise<void> {
    await this.db.collection('users').createIndex({ username: 1 }, { unique: true });
    await this.db.collection('transactions').createIndex({ date: 1 });
    await this.db.collection('transactions').createIndex({ createdAt: -1 });
    await this.db.collection('daily_summaries').createIndex({ date: 1 }, { unique: true });
    await this.db.collection('weekly_summaries').createIndex({ weekStart: 1 }, { unique: true });
    await this.db.collection('monthly_summaries').createIndex({ month: 1 }, { unique: true });
  }

  private async initializeMenuItems(): Promise<void> {
    const defaultItems = [
      {
        name: "Masala Chai",
        description: "Traditional spiced tea",
        price: "25.00",
        category: "Tea",
        image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        available: true,
      },
      {
        name: "Green Tea",
        description: "Healthy herbal tea",
        price: "30.00",
        category: "Tea",
        image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        available: true,
      },
      {
        name: "Cappuccino",
        description: "Rich coffee with foam",
        price: "80.00",
        category: "Coffee",
        image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        available: true,
      },
      {
        name: "Black Coffee",
        description: "Strong black coffee",
        price: "50.00",
        category: "Coffee",
        image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        available: true,
      },
      {
        name: "Samosa",
        description: "Crispy fried snack",
        price: "20.00",
        category: "Snacks",
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        available: true,
      },
      {
        name: "Veg Sandwich",
        description: "Fresh vegetable sandwich",
        price: "60.00",
        category: "Snacks",
        image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        available: true,
      },
      {
        name: "Orange Juice",
        description: "Fresh squeezed orange",
        price: "40.00",
        category: "Beverages",
        image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        available: true,
      },
      {
        name: "Mango Lassi",
        description: "Sweet yogurt drink",
        price: "45.00",
        category: "Beverages",
        image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        available: true,
      },
    ];

    for (const item of defaultItems) {
      await this.createMenuItem(item);
    }
  }

  // Implementation of all IStorage methods for MongoDB...
  // (Similar to MemStorage but using MongoDB operations)
  
  async getUser(id: string): Promise<User | undefined> {
    const user = await this.db.collection('users').findOne({ id });
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await this.db.collection('users').findOne({ username });
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    await this.db.collection('users').insertOne(user);
    return user;
  }

  async getMenuItems(): Promise<MenuItem[]> {
    return await this.db.collection('menu_items').find({}).toArray();
  }

  async getMenuItem(id: string): Promise<MenuItem | undefined> {
    const item = await this.db.collection('menu_items').findOne({ id });
    return item || undefined;
  }

  async createMenuItem(insertItem: InsertMenuItem): Promise<MenuItem> {
    const id = randomUUID();
    const item: MenuItem = { ...insertItem, id };
    await this.db.collection('menu_items').insertOne(item);
    return item;
  }

  async updateMenuItem(id: string, updateData: Partial<MenuItem>): Promise<MenuItem | undefined> {
    const result = await this.db.collection('menu_items').findOneAndUpdate(
      { id },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    return result || undefined;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const now = new Date();
    const transaction: Transaction = { 
      ...insertTransaction, 
      id,
      createdAt: now,
      billerName: insertTransaction.billerName || 'Sriram',
      extras: insertTransaction.extras || null,
      splitPayment: insertTransaction.splitPayment || null,
      creditor: insertTransaction.creditor || null
    };
    
    await this.db.collection('transactions').insertOne(transaction);
    await this.updateSummaries(transaction);
    
    return transaction;
  }

  async getTransactions(limit?: number): Promise<Transaction[]> {
    const query = this.db.collection('transactions').find({}).sort({ createdAt: -1 });
    if (limit) query.limit(limit);
    return await query.toArray();
  }

  async getTransactionsByDate(date: string): Promise<Transaction[]> {
    return await this.db.collection('transactions')
      .find({ date })
      .sort({ createdAt: -1 })
      .toArray();
  }

  async getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    return await this.db.collection('transactions')
      .find({ 
        date: { 
          $gte: startDate, 
          $lte: endDate 
        } 
      })
      .sort({ createdAt: -1 })
      .toArray();
  }

  async createDailySummary(insertSummary: InsertDailySummary): Promise<DailySummary> {
    const id = randomUUID();
    const summary: DailySummary = { 
      ...insertSummary, 
      id,
      createdAt: new Date()
    };
    
    await this.db.collection('daily_summaries').insertOne(summary);
    return summary;
  }

  async getDailySummary(date: string): Promise<DailySummary | undefined> {
    const summary = await this.db.collection('daily_summaries').findOne({ date });
    return summary || undefined;
  }

  async getDailySummaries(limit?: number): Promise<DailySummary[]> {
    const query = this.db.collection('daily_summaries').find({}).sort({ date: -1 });
    if (limit) query.limit(limit);
    return await query.toArray();
  }

  async createWeeklySummary(insertSummary: InsertWeeklySummary): Promise<WeeklySummary> {
    const id = randomUUID();
    const summary: WeeklySummary = { 
      ...insertSummary, 
      id,
      createdAt: new Date()
    };
    
    await this.db.collection('weekly_summaries').insertOne(summary);
    return summary;
  }

  async getWeeklySummary(weekStart: string): Promise<WeeklySummary | undefined> {
    const summary = await this.db.collection('weekly_summaries').findOne({ weekStart });
    return summary || undefined;
  }

  async getWeeklySummaries(limit?: number): Promise<WeeklySummary[]> {
    const query = this.db.collection('weekly_summaries').find({}).sort({ weekStart: -1 });
    if (limit) query.limit(limit);
    return await query.toArray();
  }

  async createMonthlySummary(insertSummary: InsertMonthlySummary): Promise<MonthlySummary> {
    const id = randomUUID();
    const summary: MonthlySummary = { 
      ...insertSummary, 
      id,
      createdAt: new Date()
    };
    
    await this.db.collection('monthly_summaries').insertOne(summary);
    return summary;
  }

  async getMonthlySummary(month: string): Promise<MonthlySummary | undefined> {
    const summary = await this.db.collection('monthly_summaries').findOne({ month });
    return summary || undefined;
  }

  async getMonthlySummaries(limit?: number): Promise<MonthlySummary[]> {
    const query = this.db.collection('monthly_summaries').find({}).sort({ month: -1 });
    if (limit) query.limit(limit);
    return await query.toArray();
  }

  private async updateSummaries(transaction: Transaction): Promise<void> {
    let gpayAmount = 0;
    let cashAmount = 0;

    if (transaction.paymentMethod === 'gpay') {
      gpayAmount = parseFloat(transaction.totalAmount);
    } else if (transaction.paymentMethod === 'cash') {
      cashAmount = parseFloat(transaction.totalAmount);
    } else if (transaction.paymentMethod === 'split' && transaction.splitPayment) {
      const splitData = transaction.splitPayment as any;
      gpayAmount = splitData.gpayAmount || 0;
      cashAmount = splitData.cashAmount || 0;
    }

    // Update daily summary
    const existingDaily = await this.getDailySummary(transaction.date);
    if (existingDaily) {
      const newTotalAmount = (parseFloat(existingDaily.totalAmount.toString()) + parseFloat(transaction.totalAmount)).toFixed(2);
      const newGpayAmount = (parseFloat(existingDaily.gpayAmount.toString()) + gpayAmount).toFixed(2);
      const newCashAmount = (parseFloat(existingDaily.cashAmount.toString()) + cashAmount).toFixed(2);
      const newOrderCount = existingDaily.orderCount + 1;
      
      await this.db.collection('daily_summaries').updateOne(
        { date: transaction.date },
        {
          $set: {
            totalAmount: newTotalAmount,
            gpayAmount: newGpayAmount,
            cashAmount: newCashAmount,
            orderCount: newOrderCount
          }
        }
      );
    } else {
      await this.createDailySummary({
        date: transaction.date,
        totalAmount: transaction.totalAmount,
        gpayAmount: gpayAmount.toFixed(2),
        cashAmount: cashAmount.toFixed(2),
        orderCount: 1,
      });
    }

    // Similar updates for weekly and monthly summaries...
    const weekStart = this.getWeekStart(new Date(transaction.date));
    const weekEnd = this.getWeekEnd(new Date(transaction.date));
    const existingWeekly = await this.getWeeklySummary(weekStart);
    
    if (existingWeekly) {
      const newTotalAmount = (parseFloat(existingWeekly.totalAmount.toString()) + parseFloat(transaction.totalAmount)).toFixed(2);
      const newGpayAmount = (parseFloat(existingWeekly.gpayAmount.toString()) + gpayAmount).toFixed(2);
      const newCashAmount = (parseFloat(existingWeekly.cashAmount.toString()) + cashAmount).toFixed(2);
      const newOrderCount = existingWeekly.orderCount + 1;
      
      await this.db.collection('weekly_summaries').updateOne(
        { weekStart },
        {
          $set: {
            totalAmount: newTotalAmount,
            gpayAmount: newGpayAmount,
            cashAmount: newCashAmount,
            orderCount: newOrderCount
          }
        }
      );
    } else {
      await this.createWeeklySummary({
        weekStart,
        weekEnd,
        totalAmount: transaction.totalAmount,
        gpayAmount: gpayAmount.toFixed(2),
        cashAmount: cashAmount.toFixed(2),
        orderCount: 1,
      });
    }

    const month = transaction.date.substring(0, 7);
    const existingMonthly = await this.getMonthlySummary(month);
    
    if (existingMonthly) {
      const newTotalAmount = (parseFloat(existingMonthly.totalAmount.toString()) + parseFloat(transaction.totalAmount)).toFixed(2);
      const newGpayAmount = (parseFloat(existingMonthly.gpayAmount.toString()) + gpayAmount).toFixed(2);
      const newCashAmount = (parseFloat(existingMonthly.cashAmount.toString()) + cashAmount).toFixed(2);
      const newOrderCount = existingMonthly.orderCount + 1;
      
      await this.db.collection('monthly_summaries').updateOne(
        { month },
        {
          $set: {
            totalAmount: newTotalAmount,
            gpayAmount: newGpayAmount,
            cashAmount: newCashAmount,
            orderCount: newOrderCount
          }
        }
      );
    } else {
      await this.createMonthlySummary({
        month,
        totalAmount: transaction.totalAmount,
        gpayAmount: gpayAmount.toFixed(2),
        cashAmount: cashAmount.toFixed(2),
        orderCount: 1,
      });
    }
  }

  private getWeekStart(date: Date): string {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    return monday.toISOString().split('T')[0];
  }

  private getWeekEnd(date: Date): string {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? 0 : 7);
    const sunday = new Date(date.setDate(diff));
    return sunday.toISOString().split('T')[0];
  }

  // Clear data methods
  async clearDataByDay(date: string): Promise<void> {
    // Remove transactions for the specific date
    await this.db.collection('transactions').deleteMany({ date });
    
    // Remove daily summary for the date
    await this.db.collection('daily_summaries').deleteOne({ date });
    
    // Update weekly and monthly summaries by recalculating
    await this.recalculateWeeklySummary(date);
    await this.recalculateMonthlySummary(date);
  }

  async clearDataByWeek(weekStart: string): Promise<void> {
    const weekEnd = this.getWeekEnd(new Date(weekStart));
    
    // Remove transactions for the week
    await this.db.collection('transactions').deleteMany({
      date: { $gte: weekStart, $lte: weekEnd }
    });
    
    // Remove daily summaries for the week
    await this.db.collection('daily_summaries').deleteMany({
      date: { $gte: weekStart, $lte: weekEnd }
    });
    
    // Remove weekly summary
    await this.db.collection('weekly_summaries').deleteOne({ weekStart });
    
    // Update monthly summary by recalculating
    await this.recalculateMonthlySummary(weekStart);
  }

  async clearDataByMonth(month: string): Promise<void> {
    // Remove transactions for the month
    await this.db.collection('transactions').deleteMany({
      date: { $regex: `^${month}` }
    });
    
    // Remove daily summaries for the month
    await this.db.collection('daily_summaries').deleteMany({
      date: { $regex: `^${month}` }
    });
    
    // Remove weekly summaries that fall within the month
    await this.db.collection('weekly_summaries').deleteMany({
      weekStart: { $regex: `^${month}` }
    });
    
    // Remove monthly summary
    await this.db.collection('monthly_summaries').deleteOne({ month });
  }

  private async recalculateWeeklySummary(date: string): Promise<void> {
    const weekStart = this.getWeekStart(new Date(date));
    const weekEnd = this.getWeekEnd(new Date(date));
    
    const weekTransactions = await this.db.collection('transactions')
      .find({ date: { $gte: weekStart, $lte: weekEnd } })
      .toArray();
    
    // Remove existing weekly summary
    await this.db.collection('weekly_summaries').deleteOne({ weekStart });
    
    if (weekTransactions.length === 0) {
      return;
    }
    
    const totalAmount = weekTransactions.reduce((sum, t) => sum + parseFloat(t.totalAmount), 0);
    const gpayAmount = weekTransactions
      .filter(t => t.paymentMethod === 'gpay')
      .reduce((sum, t) => sum + parseFloat(t.totalAmount), 0);
    const cashAmount = weekTransactions
      .filter(t => t.paymentMethod === 'cash')
      .reduce((sum, t) => sum + parseFloat(t.totalAmount), 0);
    
    await this.createWeeklySummary({
      weekStart,
      weekEnd,
      totalAmount: totalAmount.toFixed(2),
      gpayAmount: gpayAmount.toFixed(2),
      cashAmount: cashAmount.toFixed(2),
      orderCount: weekTransactions.length,
    });
  }

  private async recalculateMonthlySummary(date: string): Promise<void> {
    const month = date.substring(0, 7);
    
    const monthTransactions = await this.db.collection('transactions')
      .find({ date: { $regex: `^${month}` } })
      .toArray();
    
    // Remove existing monthly summary
    await this.db.collection('monthly_summaries').deleteOne({ month });
    
    if (monthTransactions.length === 0) {
      return;
    }
    
    const totalAmount = monthTransactions.reduce((sum, t) => sum + parseFloat(t.totalAmount), 0);
    const gpayAmount = monthTransactions
      .filter(t => t.paymentMethod === 'gpay')
      .reduce((sum, t) => sum + parseFloat(t.totalAmount), 0);
    const cashAmount = monthTransactions
      .filter(t => t.paymentMethod === 'cash')
      .reduce((sum, t) => sum + parseFloat(t.totalAmount), 0);
    
    await this.createMonthlySummary({
      month,
      totalAmount: totalAmount.toFixed(2),
      gpayAmount: gpayAmount.toFixed(2),
      cashAmount: cashAmount.toFixed(2),
      orderCount: monthTransactions.length,
    });
  }
}

// Initialize storage based on environment
let storageInstance: IStorage;

async function initializeStorage(): Promise<IStorage> {
  const mongoConnectionString = process.env.MONGODB_URI || process.env.DATABASE_URL;
  
  if (mongoConnectionString && mongoConnectionString.includes('mongodb')) {
    console.log("🔄 Initializing MongoDB Atlas storage...");
    try {
      const mongoStorage = new MongoStorage(mongoConnectionString);
      await mongoStorage.connect();
      storageInstance = mongoStorage;
      console.log("✅ MongoDB Atlas storage initialized successfully");
      return storageInstance;
    } catch (error) {
      console.error("❌ MongoDB Atlas initialization failed:", error);
      console.log("🔄 Falling back to in-memory storage...");
    }
  } else {
    console.log("📝 MongoDB connection string not provided, using in-memory storage");
  }
  
  storageInstance = new MemStorage();
  console.log("✅ In-memory storage initialized");
  return storageInstance;
}

// Export the storage instance
export const storage = await initializeStorage();

// Graceful shutdown for MongoDB
process.on('SIGINT', async () => {
  if (storageInstance && 'disconnect' in storageInstance) {
    await storageInstance.disconnect?.();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  if (storageInstance && 'disconnect' in storageInstance) {
    await storageInstance.disconnect?.();
  }
  process.exit(0);
});
