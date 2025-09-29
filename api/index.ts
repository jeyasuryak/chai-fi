import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import { registerRoutes } from "../server/routes";
import { serveStatic, log } from "../server/vite";

const app = express();

// Increase payload limits to prevent 413 errors
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// CORS headers for Vercel
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Health check endpoint - prevents 404 errors
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Timeout middleware to prevent 504 errors
app.use((req, res, next) => {
  // Set timeout for all requests (25 seconds, less than Vercel's 30s limit)
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(504).json({ 
        error: 'Request timeout',
        message: 'The request took too long to process'
      });
    }
  }, 25000);

  res.on('finish', () => {
    clearTimeout(timeout);
  });

  next();
});

// Error handling middleware - prevents 500 errors from crashing
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Server Error:', err);
  
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Ensure we always send a response
  if (!res.headersSent) {
    res.status(status).json({ 
      error: true,
      message,
      timestamp: new Date().toISOString()
    });
  }
});

// Initialize routes with error handling
let routesInitialized = false;

const initializeApp = async () => {
  if (routesInitialized) return app;
  
  try {
    console.log('Initializing routes...');
    await registerRoutes(app);
    
    // Serve static files in production
    serveStatic(app);
    
    routesInitialized = true;
    console.log('Routes initialized successfully');
    
    return app;
  } catch (error) {
    console.error("Failed to initialize routes:", error);
    
    // Fallback error handler
    app.use('*', (req, res) => {
      res.status(503).json({ 
        error: 'Service temporarily unavailable',
        message: 'Server initialization failed',
        timestamp: new Date().toISOString()
      });
    });
    
    return app;
  }
};

// Export for Vercel
export default async (req: Request, res: Response) => {
  try {
    const initializedApp = await initializeApp();
    return initializedApp(req, res);
  } catch (error) {
    console.error('Request handling error:', error);
    
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal server error',
        message: 'Failed to process request',
        timestamp: new Date().toISOString()
      });
    }
  }
};