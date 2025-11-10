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

      req.on('close', () => {
        // Cleanup if needed
      });
    });

    // POST endpoint for sending messages
    app.post('/mcp', async (req, res) => {
      try {
        // Manual JSON-RPC handling
        const { id, method, params } = req.body;

        let result;
        if (method === 'tools/list') {
          result = await server.listTools();
        } else if (method === 'tools/call') {
          // Use the tool call handler
          const toolCall = {
            method: 'tools/call',
            params: { name: params.name, arguments: params.arguments }
          };
          result = await server.processToolCall(toolCall);
        } else {
          throw new Error(`Unknown method: ${method}`);
        }

        res.json({
          jsonrpc: '2.0',
          id,
          result
        });
      } catch (error: any) {
        res.status(500).json({
          jsonrpc: '2.0',
          id: req.body.id,
          error: { code: -32000, message: error.message }
        });
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