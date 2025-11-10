import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import express from 'express';
import { registerTools } from './tools/index.js';

const server = new Server(
  {
    name: 'terMcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: { listChanged: true },
    },
  },
);

// Register all tools
registerTools(server);

// Start the server
async function main() {
  const transportType = process.env.TRANSPORT || 'stdio';

  if (transportType === 'sse') {
    // HTTP/SSE transport
    const app = express();
    const port = parseInt(process.env.PORT || '3000');

    app.use(express.json());

    // SSE endpoint
    app.get('/sse', (req, res) => {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      });

      // Send initial connection message
      res.write('data: {"type": "connection", "data": "connected"}\n\n');

      // Handle MCP messages via POST
      const messageHandler = async (message: any) => {
        try {
          const response = await server.processRequest(message);
          res.write(`data: ${JSON.stringify(response)}\n\n`);
        } catch (error: any) {
          res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        }
      };

      // Store handler for POST requests
      (req as any).sseHandler = messageHandler;

      req.on('close', () => {
        // Cleanup if needed
      });
    });

    // POST endpoint for sending messages
    app.post('/mcp', async (req, res) => {
      try {
        const response = await server.processRequest(req.body);
        res.json(response);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    app.listen(port, () => {
      console.error(`TerMCP server started with HTTP/SSE transport on port ${port}`);
      console.error(`SSE endpoint: http://localhost:${port}/sse`);
      console.error(`Message endpoint: http://localhost:${port}/mcp`);
    });
  } else {
    // Default stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('TerMCP server started with stdio transport');
  }
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});