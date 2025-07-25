// Simple Lambda handler for API Gateway V2
export const handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  const { requestContext, body, queryStringParameters, headers } = event;
  const { http } = requestContext;
  const { method, path } = http;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };
  
  try {
    // Handle OPTIONS requests for CORS
    if (method === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: ''
      };
    }
    
    // Route handling
    if (method === 'GET' && path === '/') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          message: 'Hello World!',
          server: 'Lambda with SST ApiGatewayV2',
          timestamp: new Date().toISOString(),
          https: true
        })
      };
    }
    
    if (method === 'GET' && path === '/health') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          status: 'healthy',
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
          https: true
        })
      };
    }
    
    if (method === 'GET' && path === '/api/users') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify([
          { id: 1, name: 'Alice', email: 'alice@example.com' },
          { id: 2, name: 'Bob', email: 'bob@example.com' }
        ])
      };
    }
    
    if (method === 'POST' && path === '/api/data') {
      const requestBody = body ? JSON.parse(body) : {};
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          message: 'Data received successfully',
          receivedData: requestBody,
          timestamp: new Date().toISOString(),
          https: true
        })
      };
    }
    
    // 404 for unmatched routes
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Not Found',
        message: `Route ${method} ${path} not found`,
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('Lambda error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};

// Local development server (only runs when not in Lambda environment)
if (process.env.NODE_ENV !== 'production' && typeof process !== 'undefined' && process.argv[1] === new URL(import.meta.url).pathname) {
  const PORT = process.env.PORT || 3000;
  
  // Simple HTTP server for local testing
  const http = await import('http');
  const url = await import('url');
  
  const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    
    // Mock API Gateway V2 event structure
    const event = {
      requestContext: {
        http: {
          method: req.method,
          path: parsedUrl.pathname
        }
      },
      queryStringParameters: parsedUrl.query,
      headers: req.headers,
      body: null
    };
    
    // Get request body for POST requests
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', async () => {
        event.body = body;
        const response = await handler(event);
        
        res.writeHead(response.statusCode, response.headers);
        res.end(response.body);
      });
    } else {
      const response = await handler(event);
      
      res.writeHead(response.statusCode, response.headers);
      res.end(response.body);
    }
  });
  
  server.listen(PORT, () => {
    console.log(`Local server running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}
