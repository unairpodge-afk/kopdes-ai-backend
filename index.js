/**
 * Kopdes AI Backend Server
 * Main entrypoint for Kopdes AI Super App backend services.
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import Middlewares
const logger = require('./src/middlewares/logger');
const errorHandler = require('./src/middlewares/errorHandler');

// Import Routers
const apiRouter = require('./src/routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend integration
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Log requests
app.use(logger);

// Base routing
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Kopdes AI Backend Server',
    roadmap: 'V1.0 - Digital Cooperative Foundation',
    port: PORT
  });
});

// Versioned APIs
app.use('/api/v1', apiRouter);

// Catch 404 (Not Found)
app.use((req, res, next) => {
  const error = new Error(`Cannot find ${req.method} ${req.originalUrl} on this server`);
  error.statusCode = 404;
  next(error);
});

// Error handling middleware
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`  Kopdes AI Backend Server is running!`);
    console.log(`  Port       : ${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Health     : http://localhost:${PORT}/api/v1/health`);
    console.log(`=========================================`);
  });
}

module.exports = app;
