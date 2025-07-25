const serverlessExpress = require('@vendia/serverless-express');
const express = require('express');
const cors = require('cors');

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url} - IP: ${req.ip || req.connection.remoteAddress}`);
  next();
});

// CORS middleware
app.use(cors());

// Middleware to parse JSON requests
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Hello World!',
    server: 'Express on AWS Lambda via SST',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Sample API endpoint
app.get('/api/users', (req, res) => {
  res.json([
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' }
  ]);
});

// POST endpoint example
app.post('/api/data', (req, res) => {
  const { body } = req;
  res.json({
    message: 'Data received successfully',
    receivedData: body,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Create the serverless express handler
const serverlessHandler = serverlessExpress({ app });

// Export handler for SST Lambda - try different export formats
exports.handler = serverlessHandler;
module.exports.handler = serverlessHandler;

// Also try default export for ESM compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { handler: serverlessHandler };
}

// Local development server (only runs when not in Lambda environment)
if (require.main === module) {
  const PORT = process.env.PORT || 9000;
  
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Health check available at http://localhost:${PORT}/health`);
  });
  
  // Graceful shutdown for local development
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
  });
  
  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
  });
}
