// server/index.ts
import dotenv2 from "dotenv";
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import dotenv from "dotenv";
import { randomUUID } from "crypto";
dotenv.config();
var MemStorage = class {
  users;
  menuItems;
  transactions;
  dailySummaries;
  weeklySummaries;
  monthlySummaries;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.menuItems = /* @__PURE__ */ new Map();
    this.transactions = /* @__PURE__ */ new Map();
    this.dailySummaries = /* @__PURE__ */ new Map();
    this.weeklySummaries = /* @__PURE__ */ new Map();
    this.monthlySummaries = /* @__PURE__ */ new Map();
    this.createUser({ username: "Inowara", password: "Inowara@2025" });
    this.createUser({ username: "Chai-fi", password: "Chai-fi@2025" });
    this.initializeMenuItems();
  }
  async initializeMenuItems() {
    const defaultItems = [
      {
        name: "Masala Chai",
        description: "Traditional spiced tea",
        price: "25.00",
        category: "Tea",
        image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        available: true
      },
      {
        name: "Green Tea",
        description: "Healthy herbal tea",
        price: "30.00",
        category: "Tea",
        image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        available: true
      },
      {
        name: "Cappuccino",
        description: "Rich coffee with foam",
        price: "80.00",
        category: "Coffee",
        image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        available: true
      },
      {
        name: "Black Coffee",
        description: "Strong black coffee",
        price: "50.00",
        category: "Coffee",
        image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        available: true
      },
      {
        name: "Samosa",
        description: "Crispy fried snack",
        price: "20.00",
        category: "Snacks",
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        available: true
      },
      {
        name: "Veg Sandwich",
        description: "Fresh vegetable sandwich",
        price: "60.00",
        category: "Snacks",
        image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        available: true
      },
      {
        name: "Orange Juice",
        description: "Fresh squeezed orange",
        price: "40.00",
        category: "Beverages",
        image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        available: true
      },
      {
        name: "Mango Lassi",
        description: "Sweet yogurt drink",
        price: "45.00",
        category: "Beverages",
        image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        available: true
      }
    ];
    for (const item of defaultItems) {
      await this.createMenuItem(item);
    }
  }
  // Users
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  // Menu Items
  async getMenuItems() {
    return Array.from(this.menuItems.values());
  }
  async getMenuItem(id) {
    return this.menuItems.get(id);
  }
  async createMenuItem(insertItem) {
    const id = randomUUID();
    const item = { ...insertItem, id };
    this.menuItems.set(id, item);
    return item;
  }
  async updateMenuItem(id, updateData) {
    const existing = this.menuItems.get(id);
    if (!existing) return void 0;
    const updated = { ...existing, ...updateData };
    this.menuItems.set(id, updated);
    return updated;
  }
  // Transactions
  async createTransaction(insertTransaction) {
    const id = randomUUID();
    const now = /* @__PURE__ */ new Date();
    const transaction = {
      ...insertTransaction,
      id,
      createdAt: now,
      billerName: insertTransaction.billerName || "Sriram",
      extras: insertTransaction.extras || null,
      splitPayment: insertTransaction.splitPayment || null,
      creditor: insertTransaction.creditor || null
    };
    this.transactions.set(id, transaction);
    await this.updateSummaries(transaction);
    return transaction;
  }
  async getTransactions(limit) {
    const transactions2 = Array.from(this.transactions.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return limit ? transactions2.slice(0, limit) : transactions2;
  }
  async getTransactionsByDate(date) {
    return Array.from(this.transactions.values()).filter((t) => t.date === date).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async getTransactionsByDateRange(startDate, endDate) {
    return Array.from(this.transactions.values()).filter((t) => t.date >= startDate && t.date <= endDate).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  // Daily Summaries
  async createDailySummary(insertSummary) {
    const id = randomUUID();
    const summary = {
      ...insertSummary,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.dailySummaries.set(insertSummary.date, summary);
    return summary;
  }
  async getDailySummary(date) {
    return this.dailySummaries.get(date);
  }
  async getDailySummaries(limit) {
    const summaries = Array.from(this.dailySummaries.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return limit ? summaries.slice(0, limit) : summaries;
  }
  // Weekly Summaries
  async createWeeklySummary(insertSummary) {
    const id = randomUUID();
    const summary = {
      ...insertSummary,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.weeklySummaries.set(insertSummary.weekStart, summary);
    return summary;
  }
  async getWeeklySummary(weekStart) {
    return this.weeklySummaries.get(weekStart);
  }
  async getWeeklySummaries(limit) {
    const summaries = Array.from(this.weeklySummaries.values()).sort((a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime());
    return limit ? summaries.slice(0, limit) : summaries;
  }
  // Monthly Summaries
  async createMonthlySummary(insertSummary) {
    const id = randomUUID();
    const summary = {
      ...insertSummary,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.monthlySummaries.set(insertSummary.month, summary);
    return summary;
  }
  async getMonthlySummary(month) {
    return this.monthlySummaries.get(month);
  }
  async getMonthlySummaries(limit) {
    const summaries = Array.from(this.monthlySummaries.values()).sort((a, b) => (/* @__PURE__ */ new Date(b.month + "-01")).getTime() - (/* @__PURE__ */ new Date(a.month + "-01")).getTime());
    return limit ? summaries.slice(0, limit) : summaries;
  }
  async updateSummaries(transaction) {
    let gpayAmount = 0;
    let cashAmount = 0;
    if (transaction.paymentMethod === "gpay") {
      gpayAmount = parseFloat(transaction.totalAmount);
    } else if (transaction.paymentMethod === "cash") {
      cashAmount = parseFloat(transaction.totalAmount);
    } else if (transaction.paymentMethod === "split" && transaction.splitPayment) {
      const splitData = transaction.splitPayment;
      gpayAmount = splitData.gpayAmount || 0;
      cashAmount = splitData.cashAmount || 0;
    }
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
        orderCount: 1
      });
    }
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
        orderCount: 1
      });
    }
    const month = transaction.date.substring(0, 7);
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
        orderCount: 1
      });
    }
  }
  getWeekStart(date) {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    return monday.toISOString().split("T")[0];
  }
  getWeekEnd(date) {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? 0 : 7);
    const sunday = new Date(date.setDate(diff));
    return sunday.toISOString().split("T")[0];
  }
  // Clear data methods
  async clearDataByDay(date) {
    const transactionsToDelete = Array.from(this.transactions.entries()).filter(([_, transaction]) => transaction.date === date).map(([id, _]) => id);
    transactionsToDelete.forEach((id) => this.transactions.delete(id));
    this.dailySummaries.delete(date);
    await this.recalculateWeeklySummary(date);
    await this.recalculateMonthlySummary(date);
  }
  async clearDataByWeek(weekStart) {
    const weekEnd = this.getWeekEnd(new Date(weekStart));
    const transactionsToDelete = Array.from(this.transactions.entries()).filter(([_, transaction]) => transaction.date >= weekStart && transaction.date <= weekEnd).map(([id, _]) => id);
    transactionsToDelete.forEach((id) => this.transactions.delete(id));
    const dailySummariesToDelete = Array.from(this.dailySummaries.entries()).filter(([date, _]) => date >= weekStart && date <= weekEnd).map(([date, _]) => date);
    dailySummariesToDelete.forEach((date) => this.dailySummaries.delete(date));
    this.weeklySummaries.delete(weekStart);
    await this.recalculateMonthlySummary(weekStart);
  }
  async clearDataByMonth(month) {
    const startDate = `${month}-01`;
    const endDate = `${month}-31`;
    const transactionsToDelete = Array.from(this.transactions.entries()).filter(([_, transaction]) => transaction.date.startsWith(month)).map(([id, _]) => id);
    transactionsToDelete.forEach((id) => this.transactions.delete(id));
    const dailySummariesToDelete = Array.from(this.dailySummaries.entries()).filter(([date, _]) => date.startsWith(month)).map(([date, _]) => date);
    dailySummariesToDelete.forEach((date) => this.dailySummaries.delete(date));
    const weeklySummariesToDelete = Array.from(this.weeklySummaries.entries()).filter(([weekStart, _]) => weekStart.startsWith(month)).map(([weekStart, _]) => weekStart);
    weeklySummariesToDelete.forEach((weekStart) => this.weeklySummaries.delete(weekStart));
    this.monthlySummaries.delete(month);
  }
  async recalculateWeeklySummary(date) {
    const weekStart = this.getWeekStart(new Date(date));
    const weekEnd = this.getWeekEnd(new Date(date));
    const weekTransactions = Array.from(this.transactions.values()).filter((t) => t.date >= weekStart && t.date <= weekEnd);
    if (weekTransactions.length === 0) {
      this.weeklySummaries.delete(weekStart);
      return;
    }
    const totalAmount = weekTransactions.reduce((sum, t) => sum + parseFloat(t.totalAmount), 0);
    const gpayAmount = weekTransactions.filter((t) => t.paymentMethod === "gpay").reduce((sum, t) => sum + parseFloat(t.totalAmount), 0);
    const cashAmount = weekTransactions.filter((t) => t.paymentMethod === "cash").reduce((sum, t) => sum + parseFloat(t.totalAmount), 0);
    await this.createWeeklySummary({
      weekStart,
      weekEnd,
      totalAmount: totalAmount.toFixed(2),
      gpayAmount: gpayAmount.toFixed(2),
      cashAmount: cashAmount.toFixed(2),
      orderCount: weekTransactions.length
    });
  }
  async recalculateMonthlySummary(date) {
    const month = date.substring(0, 7);
    const monthTransactions = Array.from(this.transactions.values()).filter((t) => t.date.startsWith(month));
    if (monthTransactions.length === 0) {
      this.monthlySummaries.delete(month);
      return;
    }
    const totalAmount = monthTransactions.reduce((sum, t) => sum + parseFloat(t.totalAmount), 0);
    const gpayAmount = monthTransactions.filter((t) => t.paymentMethod === "gpay").reduce((sum, t) => sum + parseFloat(t.totalAmount), 0);
    const cashAmount = monthTransactions.filter((t) => t.paymentMethod === "cash").reduce((sum, t) => sum + parseFloat(t.totalAmount), 0);
    await this.createMonthlySummary({
      month,
      totalAmount: totalAmount.toFixed(2),
      gpayAmount: gpayAmount.toFixed(2),
      cashAmount: cashAmount.toFixed(2),
      orderCount: monthTransactions.length
    });
  }
};
var MongoStorage = class {
  connectionString;
  dbName;
  client;
  db;
  isConnected = false;
  constructor(connectionString, dbName = "chai-fi") {
    this.connectionString = connectionString;
    this.dbName = dbName;
  }
  async connect() {
    try {
      const { MongoClient } = await import("mongodb");
      this.client = new MongoClient(this.connectionString);
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      this.isConnected = true;
      console.log("\u2705 Connected to MongoDB Atlas");
      await this.initializeDefaultData();
      await this.createIndexes();
    } catch (error) {
      console.error("\u274C MongoDB connection failed:", error);
      throw error;
    }
  }
  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.close();
      this.isConnected = false;
      console.log("Disconnected from MongoDB Atlas");
    }
  }
  async initializeDefaultData() {
    const existingUser = await this.db.collection("users").findOne({ username: "Chai-fi" });
    if (!existingUser) {
      await this.createUser({ username: "Chai-fi", password: "Chai-fi@2025" });
    }
    const menuCount = await this.db.collection("menu_items").countDocuments();
    if (menuCount === 0) {
      await this.initializeMenuItems();
    }
  }
  async createIndexes() {
    await this.db.collection("users").createIndex({ username: 1 }, { unique: true });
    await this.db.collection("transactions").createIndex({ date: 1 });
    await this.db.collection("transactions").createIndex({ createdAt: -1 });
    await this.db.collection("daily_summaries").createIndex({ date: 1 }, { unique: true });
    await this.db.collection("weekly_summaries").createIndex({ weekStart: 1 }, { unique: true });
    await this.db.collection("monthly_summaries").createIndex({ month: 1 }, { unique: true });
  }
  async initializeMenuItems() {
    const defaultItems = [
      {
        name: "Masala Chai",
        description: "Traditional spiced tea",
        price: "25.00",
        category: "Tea",
        image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        available: true
      },
      {
        name: "Green Tea",
        description: "Healthy herbal tea",
        price: "30.00",
        category: "Tea",
        image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        available: true
      },
      {
        name: "Cappuccino",
        description: "Rich coffee with foam",
        price: "80.00",
        category: "Coffee",
        image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        available: true
      },
      {
        name: "Black Coffee",
        description: "Strong black coffee",
        price: "50.00",
        category: "Coffee",
        image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        available: true
      },
      {
        name: "Samosa",
        description: "Crispy fried snack",
        price: "20.00",
        category: "Snacks",
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        available: true
      },
      {
        name: "Veg Sandwich",
        description: "Fresh vegetable sandwich",
        price: "60.00",
        category: "Snacks",
        image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        available: true
      },
      {
        name: "Orange Juice",
        description: "Fresh squeezed orange",
        price: "40.00",
        category: "Beverages",
        image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        available: true
      },
      {
        name: "Mango Lassi",
        description: "Sweet yogurt drink",
        price: "45.00",
        category: "Beverages",
        image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        available: true
      }
    ];
    for (const item of defaultItems) {
      await this.createMenuItem(item);
    }
  }
  // Implementation of all IStorage methods for MongoDB...
  // (Similar to MemStorage but using MongoDB operations)
  async getUser(id) {
    const user = await this.db.collection("users").findOne({ id });
    return user || void 0;
  }
  async getUserByUsername(username) {
    const user = await this.db.collection("users").findOne({ username });
    return user || void 0;
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = { ...insertUser, id };
    await this.db.collection("users").insertOne(user);
    return user;
  }
  async getMenuItems() {
    return await this.db.collection("menu_items").find({}).toArray();
  }
  async getMenuItem(id) {
    const item = await this.db.collection("menu_items").findOne({ id });
    return item || void 0;
  }
  async createMenuItem(insertItem) {
    const id = randomUUID();
    const item = { ...insertItem, id };
    await this.db.collection("menu_items").insertOne(item);
    return item;
  }
  async updateMenuItem(id, updateData) {
    const result = await this.db.collection("menu_items").findOneAndUpdate(
      { id },
      { $set: updateData },
      { returnDocument: "after" }
    );
    return result || void 0;
  }
  async createTransaction(insertTransaction) {
    const id = randomUUID();
    const now = /* @__PURE__ */ new Date();
    const transaction = {
      ...insertTransaction,
      id,
      createdAt: now,
      billerName: insertTransaction.billerName || "Sriram",
      extras: insertTransaction.extras || null,
      splitPayment: insertTransaction.splitPayment || null,
      creditor: insertTransaction.creditor || null
    };
    await this.db.collection("transactions").insertOne(transaction);
    await this.updateSummaries(transaction);
    return transaction;
  }
  async getTransactions(limit) {
    const query = this.db.collection("transactions").find({}).sort({ createdAt: -1 });
    if (limit) query.limit(limit);
    return await query.toArray();
  }
  async getTransactionsByDate(date) {
    return await this.db.collection("transactions").find({ date }).sort({ createdAt: -1 }).toArray();
  }
  async getTransactionsByDateRange(startDate, endDate) {
    return await this.db.collection("transactions").find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ createdAt: -1 }).toArray();
  }
  async createDailySummary(insertSummary) {
    const id = randomUUID();
    const summary = {
      ...insertSummary,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    await this.db.collection("daily_summaries").insertOne(summary);
    return summary;
  }
  async getDailySummary(date) {
    const summary = await this.db.collection("daily_summaries").findOne({ date });
    return summary || void 0;
  }
  async getDailySummaries(limit) {
    const query = this.db.collection("daily_summaries").find({}).sort({ date: -1 });
    if (limit) query.limit(limit);
    return await query.toArray();
  }
  async createWeeklySummary(insertSummary) {
    const id = randomUUID();
    const summary = {
      ...insertSummary,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    await this.db.collection("weekly_summaries").insertOne(summary);
    return summary;
  }
  async getWeeklySummary(weekStart) {
    const summary = await this.db.collection("weekly_summaries").findOne({ weekStart });
    return summary || void 0;
  }
  async getWeeklySummaries(limit) {
    const query = this.db.collection("weekly_summaries").find({}).sort({ weekStart: -1 });
    if (limit) query.limit(limit);
    return await query.toArray();
  }
  async createMonthlySummary(insertSummary) {
    const id = randomUUID();
    const summary = {
      ...insertSummary,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    await this.db.collection("monthly_summaries").insertOne(summary);
    return summary;
  }
  async getMonthlySummary(month) {
    const summary = await this.db.collection("monthly_summaries").findOne({ month });
    return summary || void 0;
  }
  async getMonthlySummaries(limit) {
    const query = this.db.collection("monthly_summaries").find({}).sort({ month: -1 });
    if (limit) query.limit(limit);
    return await query.toArray();
  }
  async updateSummaries(transaction) {
    let gpayAmount = 0;
    let cashAmount = 0;
    if (transaction.paymentMethod === "gpay") {
      gpayAmount = parseFloat(transaction.totalAmount);
    } else if (transaction.paymentMethod === "cash") {
      cashAmount = parseFloat(transaction.totalAmount);
    } else if (transaction.paymentMethod === "split" && transaction.splitPayment) {
      const splitData = transaction.splitPayment;
      gpayAmount = splitData.gpayAmount || 0;
      cashAmount = splitData.cashAmount || 0;
    }
    const existingDaily = await this.getDailySummary(transaction.date);
    if (existingDaily) {
      const newTotalAmount = (parseFloat(existingDaily.totalAmount.toString()) + parseFloat(transaction.totalAmount)).toFixed(2);
      const newGpayAmount = (parseFloat(existingDaily.gpayAmount.toString()) + gpayAmount).toFixed(2);
      const newCashAmount = (parseFloat(existingDaily.cashAmount.toString()) + cashAmount).toFixed(2);
      const newOrderCount = existingDaily.orderCount + 1;
      await this.db.collection("daily_summaries").updateOne(
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
        orderCount: 1
      });
    }
    const weekStart = this.getWeekStart(new Date(transaction.date));
    const weekEnd = this.getWeekEnd(new Date(transaction.date));
    const existingWeekly = await this.getWeeklySummary(weekStart);
    if (existingWeekly) {
      const newTotalAmount = (parseFloat(existingWeekly.totalAmount.toString()) + parseFloat(transaction.totalAmount)).toFixed(2);
      const newGpayAmount = (parseFloat(existingWeekly.gpayAmount.toString()) + gpayAmount).toFixed(2);
      const newCashAmount = (parseFloat(existingWeekly.cashAmount.toString()) + cashAmount).toFixed(2);
      const newOrderCount = existingWeekly.orderCount + 1;
      await this.db.collection("weekly_summaries").updateOne(
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
        orderCount: 1
      });
    }
    const month = transaction.date.substring(0, 7);
    const existingMonthly = await this.getMonthlySummary(month);
    if (existingMonthly) {
      const newTotalAmount = (parseFloat(existingMonthly.totalAmount.toString()) + parseFloat(transaction.totalAmount)).toFixed(2);
      const newGpayAmount = (parseFloat(existingMonthly.gpayAmount.toString()) + gpayAmount).toFixed(2);
      const newCashAmount = (parseFloat(existingMonthly.cashAmount.toString()) + cashAmount).toFixed(2);
      const newOrderCount = existingMonthly.orderCount + 1;
      await this.db.collection("monthly_summaries").updateOne(
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
        orderCount: 1
      });
    }
  }
  getWeekStart(date) {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    return monday.toISOString().split("T")[0];
  }
  getWeekEnd(date) {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? 0 : 7);
    const sunday = new Date(date.setDate(diff));
    return sunday.toISOString().split("T")[0];
  }
  // Clear data methods
  async clearDataByDay(date) {
    await this.db.collection("transactions").deleteMany({ date });
    await this.db.collection("daily_summaries").deleteOne({ date });
    await this.recalculateWeeklySummary(date);
    await this.recalculateMonthlySummary(date);
  }
  async clearDataByWeek(weekStart) {
    const weekEnd = this.getWeekEnd(new Date(weekStart));
    await this.db.collection("transactions").deleteMany({
      date: { $gte: weekStart, $lte: weekEnd }
    });
    await this.db.collection("daily_summaries").deleteMany({
      date: { $gte: weekStart, $lte: weekEnd }
    });
    await this.db.collection("weekly_summaries").deleteOne({ weekStart });
    await this.recalculateMonthlySummary(weekStart);
  }
  async clearDataByMonth(month) {
    await this.db.collection("transactions").deleteMany({
      date: { $regex: `^${month}` }
    });
    await this.db.collection("daily_summaries").deleteMany({
      date: { $regex: `^${month}` }
    });
    await this.db.collection("weekly_summaries").deleteMany({
      weekStart: { $regex: `^${month}` }
    });
    await this.db.collection("monthly_summaries").deleteOne({ month });
  }
  async recalculateWeeklySummary(date) {
    const weekStart = this.getWeekStart(new Date(date));
    const weekEnd = this.getWeekEnd(new Date(date));
    const weekTransactions = await this.db.collection("transactions").find({ date: { $gte: weekStart, $lte: weekEnd } }).toArray();
    await this.db.collection("weekly_summaries").deleteOne({ weekStart });
    if (weekTransactions.length === 0) {
      return;
    }
    const totalAmount = weekTransactions.reduce((sum, t) => sum + parseFloat(t.totalAmount), 0);
    const gpayAmount = weekTransactions.filter((t) => t.paymentMethod === "gpay").reduce((sum, t) => sum + parseFloat(t.totalAmount), 0);
    const cashAmount = weekTransactions.filter((t) => t.paymentMethod === "cash").reduce((sum, t) => sum + parseFloat(t.totalAmount), 0);
    await this.createWeeklySummary({
      weekStart,
      weekEnd,
      totalAmount: totalAmount.toFixed(2),
      gpayAmount: gpayAmount.toFixed(2),
      cashAmount: cashAmount.toFixed(2),
      orderCount: weekTransactions.length
    });
  }
  async recalculateMonthlySummary(date) {
    const month = date.substring(0, 7);
    const monthTransactions = await this.db.collection("transactions").find({ date: { $regex: `^${month}` } }).toArray();
    await this.db.collection("monthly_summaries").deleteOne({ month });
    if (monthTransactions.length === 0) {
      return;
    }
    const totalAmount = monthTransactions.reduce((sum, t) => sum + parseFloat(t.totalAmount), 0);
    const gpayAmount = monthTransactions.filter((t) => t.paymentMethod === "gpay").reduce((sum, t) => sum + parseFloat(t.totalAmount), 0);
    const cashAmount = monthTransactions.filter((t) => t.paymentMethod === "cash").reduce((sum, t) => sum + parseFloat(t.totalAmount), 0);
    await this.createMonthlySummary({
      month,
      totalAmount: totalAmount.toFixed(2),
      gpayAmount: gpayAmount.toFixed(2),
      cashAmount: cashAmount.toFixed(2),
      orderCount: monthTransactions.length
    });
  }
};
var storageInstance;
async function initializeStorage() {
  const mongoConnectionString = process.env.MONGODB_URI || process.env.DATABASE_URL;
  if (mongoConnectionString && mongoConnectionString.includes("mongodb")) {
    console.log("\u{1F504} Initializing MongoDB Atlas storage...");
    try {
      const mongoStorage = new MongoStorage(mongoConnectionString);
      await mongoStorage.connect();
      storageInstance = mongoStorage;
      console.log("\u2705 MongoDB Atlas storage initialized successfully");
      return storageInstance;
    } catch (error) {
      console.error("\u274C MongoDB Atlas initialization failed:", error);
      console.log("\u{1F504} Falling back to in-memory storage...");
    }
  } else {
    console.log("\u{1F4DD} MongoDB connection string not provided, using in-memory storage");
  }
  storageInstance = new MemStorage();
  console.log("\u2705 In-memory storage initialized");
  return storageInstance;
}
var storage = await initializeStorage();
process.on("SIGINT", async () => {
  if (storageInstance && "disconnect" in storageInstance) {
    await storageInstance.disconnect?.();
  }
  process.exit(0);
});
process.on("SIGTERM", async () => {
  if (storageInstance && "disconnect" in storageInstance) {
    await storageInstance.disconnect?.();
  }
  process.exit(0);
});

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var menuItems = pgTable("menu_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  image: text("image").notNull(),
  available: boolean("available").notNull().default(true)
});
var transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  items: jsonb("items").notNull(),
  // Array of {id, name, price, quantity}
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  // 'gpay', 'cash', 'split', or 'creditor'
  billerName: text("biller_name").notNull().default("Sriram"),
  splitPayment: jsonb("split_payment"),
  // {gpayAmount: number, cashAmount: number} for split payments
  extras: jsonb("extras"),
  // Array of {name: string, amount: number}
  creditor: jsonb("creditor"),
  // {name: string, paidAmount: number, balanceAmount: number, totalAmount: number}
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  date: text("date").notNull(),
  // YYYY-MM-DD format
  dayName: text("day_name").notNull(),
  time: text("time").notNull()
  // HH:MM AM/PM format
});
var dailySummaries = pgTable("daily_summaries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull().unique(),
  // YYYY-MM-DD format
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  gpayAmount: decimal("gpay_amount", { precision: 10, scale: 2 }).notNull(),
  cashAmount: decimal("cash_amount", { precision: 10, scale: 2 }).notNull(),
  orderCount: integer("order_count").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});
var weeklySummaries = pgTable("weekly_summaries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  weekStart: text("week_start").notNull(),
  // YYYY-MM-DD format (Monday)
  weekEnd: text("week_end").notNull(),
  // YYYY-MM-DD format (Sunday)
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  gpayAmount: decimal("gpay_amount", { precision: 10, scale: 2 }).notNull(),
  cashAmount: decimal("cash_amount", { precision: 10, scale: 2 }).notNull(),
  orderCount: integer("order_count").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});
var monthlySummaries = pgTable("monthly_summaries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  month: text("month").notNull(),
  // YYYY-MM format
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  gpayAmount: decimal("gpay_amount", { precision: 10, scale: 2 }).notNull(),
  cashAmount: decimal("cash_amount", { precision: 10, scale: 2 }).notNull(),
  orderCount: integer("order_count").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true
});
var insertMenuItemSchema = createInsertSchema(menuItems).omit({
  id: true
});
var insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true
});
var insertDailySummarySchema = createInsertSchema(dailySummaries).omit({
  id: true,
  createdAt: true
});
var insertWeeklySummarySchema = createInsertSchema(weeklySummaries).omit({
  id: true,
  createdAt: true
});
var insertMonthlySummarySchema = createInsertSchema(monthlySummaries).omit({
  id: true,
  createdAt: true
});

// server/routes.ts
import { z } from "zod";
async function registerRoutes(app2) {
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      res.json({ user: { id: user.id, username: user.username } });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });
  app2.get("/api/menu", async (req, res) => {
    try {
      const items = await storage.getMenuItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch menu items" });
    }
  });
  app2.get("/api/menu/:id", async (req, res) => {
    try {
      const item = await storage.getMenuItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Menu item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch menu item" });
    }
  });
  app2.post("/api/menu", async (req, res) => {
    try {
      const { name, description, price, category, image, available } = req.body;
      const newItem = await storage.createMenuItem({
        name,
        description,
        price,
        category,
        image,
        available: available ?? true
      });
      res.json(newItem);
    } catch (error) {
      res.status(500).json({ error: "Failed to create menu item" });
    }
  });
  app2.put("/api/menu/:id", async (req, res) => {
    try {
      const { name, description, price, category, image, available } = req.body;
      const updatedItem = await storage.updateMenuItem(req.params.id, {
        name,
        description,
        price,
        category,
        image,
        available
      });
      if (!updatedItem) {
        return res.status(404).json({ error: "Menu item not found" });
      }
      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ error: "Failed to update menu item" });
    }
  });
  app2.delete("/api/menu/:id", async (req, res) => {
    try {
      const item = await storage.getMenuItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Menu item not found" });
      }
      const updatedItem = await storage.updateMenuItem(req.params.id, { available: false });
      res.json({ message: "Menu item marked as unavailable", item: updatedItem });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete menu item" });
    }
  });
  app2.post("/api/transactions", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validatedData);
      res.json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid transaction data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create transaction" });
    }
  });
  app2.get("/api/transactions", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : void 0;
      const transactions2 = await storage.getTransactions(limit);
      res.json(transactions2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });
  app2.get("/api/transactions/date/:date", async (req, res) => {
    try {
      const transactions2 = await storage.getTransactionsByDate(req.params.date);
      res.json(transactions2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions for date" });
    }
  });
  app2.get("/api/summaries/daily", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : void 0;
      const summaries = await storage.getDailySummaries(limit);
      res.json(summaries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch daily summaries" });
    }
  });
  app2.get("/api/summaries/daily/:date", async (req, res) => {
    try {
      const summary = await storage.getDailySummary(req.params.date);
      if (!summary) {
        return res.status(404).json({ error: "Daily summary not found" });
      }
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch daily summary" });
    }
  });
  app2.get("/api/summaries/weekly", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : void 0;
      const summaries = await storage.getWeeklySummaries(limit);
      res.json(summaries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch weekly summaries" });
    }
  });
  app2.get("/api/summaries/monthly", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : void 0;
      const summaries = await storage.getMonthlySummaries(limit);
      res.json(summaries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch monthly summaries" });
    }
  });
  app2.get("/api/creditors/summary", async (req, res) => {
    try {
      const transactions2 = await storage.getTransactions();
      const creditorTransactions = transactions2.filter(
        (t) => t.paymentMethod === "creditor" && t.creditor
      );
      const creditorSummary = creditorTransactions.reduce((acc, transaction) => {
        const creditor = transaction.creditor;
        if (!creditor || !creditor.name) return acc;
        if (!acc[creditor.name]) {
          acc[creditor.name] = {
            name: creditor.name,
            totalAmount: 0,
            paidAmount: 0,
            balanceAmount: 0,
            transactionCount: 0
          };
        }
        acc[creditor.name].totalAmount += creditor.totalAmount || 0;
        acc[creditor.name].paidAmount += creditor.paidAmount || 0;
        acc[creditor.name].balanceAmount += creditor.balanceAmount || 0;
        acc[creditor.name].transactionCount += 1;
        return acc;
      }, {});
      res.json(Object.values(creditorSummary));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch creditor summary" });
    }
  });
  app2.get("/api/menu/sales", async (req, res) => {
    try {
      const date = req.query.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const transactions2 = await storage.getTransactionsByDate(date);
      const menuItems2 = await storage.getMenuItems();
      const salesData = menuItems2.map((item) => {
        const totalSold = transactions2.reduce((count, transaction) => {
          const items = transaction.items;
          const itemSold = items.find((i) => i.id === item.id);
          return count + (itemSold ? itemSold.quantity : 0);
        }, 0);
        return {
          id: item.id,
          name: item.name,
          category: item.category,
          price: item.price,
          totalSold,
          revenue: totalSold * parseFloat(item.price)
        };
      });
      res.json(salesData.sort((a, b) => b.totalSold - a.totalSold));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch menu item sales" });
    }
  });
  app2.delete("/api/data/clear", async (req, res) => {
    try {
      const { period, date } = req.query;
      if (period === "day" && date) {
        await storage.clearDataByDay(date);
        res.json({ message: `Cleared data for ${date}` });
      } else if (period === "week" && date) {
        await storage.clearDataByWeek(date);
        res.json({ message: `Cleared weekly data starting ${date}` });
      } else if (period === "month" && date) {
        await storage.clearDataByMonth(date);
        res.json({ message: `Cleared monthly data for ${date}` });
      } else {
        res.status(400).json({ error: "Invalid parameters. Required: period (day/week/month) and date" });
      }
    } catch (error) {
      console.error("Clear data error:", error);
      res.status(500).json({ error: "Failed to clear data" });
    }
  });
  app2.get("/api/download/daily/:date", async (req, res) => {
    try {
      const summary = await storage.getDailySummary(req.params.date);
      const transactions2 = await storage.getTransactionsByDate(req.params.date);
      if (!summary) {
        return res.status(404).json({ error: "Daily summary not found" });
      }
      res.json({ summary, transactions: transactions2 });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch daily data" });
    }
  });
  app2.get("/api/download/weekly/:weekStart", async (req, res) => {
    try {
      const summary = await storage.getWeeklySummary(req.params.weekStart);
      if (!summary) {
        return res.status(404).json({ error: "Weekly summary not found" });
      }
      const transactions2 = await storage.getTransactionsByDateRange(
        summary.weekStart,
        summary.weekEnd
      );
      res.json({ summary, transactions: transactions2 });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch weekly data" });
    }
  });
  app2.get("/api/download/monthly/:month", async (req, res) => {
    try {
      const summary = await storage.getMonthlySummary(req.params.month);
      if (!summary) {
        return res.status(404).json({ error: "Monthly summary not found" });
      }
      const startDate = `${req.params.month}-01`;
      const endDate = `${req.params.month}-31`;
      const transactions2 = await storage.getTransactionsByDateRange(startDate, endDate);
      res.json({ summary, transactions: transactions2 });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch monthly data" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
dotenv2.config();
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
