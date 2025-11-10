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

// Tool handlers (implementations will be in separate files)
async function handleExecuteCommand(args: any) {
  // Implementation in tools/command.ts
  const { executeCommand } = await import('./tools/command.js');
  return executeCommand(args);
}

async function handleReadFile(args: any) {
  const { readFile } = await import('./tools/file.js');
  return readFile(args);
}

async function handleWriteFile(args: any) {
  const { writeFile } = await import('./tools/file.js');
  return writeFile(args);
}

async function handleListDirectory(args: any) {
  const { listDirectory } = await import('./tools/file.js');
  return listDirectory(args);
}

async function handleGetSystemInfo(args: any) {
  const { getSystemInfo } = await import('./tools/system.js');
  return getSystemInfo(args);
}

async function handleCreateFile(args: any) {
  const { createFile } = await import('./tools/filesystem.js');
  return createFile(args);
}

async function handleCreateDirectory(args: any) {
  const { createDirectory } = await import('./tools/filesystem.js');
  return createDirectory(args);
}

async function handleDeleteFile(args: any) {
  const { deleteFile } = await import('./tools/filesystem.js');
  return deleteFile(args);
}

async function handleDeleteDirectory(args: any) {
  const { deleteDirectory } = await import('./tools/filesystem.js');
  return deleteDirectory(args);
}

async function handleCopyFile(args: any) {
  const { copyFile } = await import('./tools/filesystem.js');
  return copyFile(args);
}

async function handleMoveFile(args: any) {
  const { moveFile } = await import('./tools/filesystem.js');
  return moveFile(args);
}

async function handleGetFileInfo(args: any) {
  const { getFileInfo } = await import('./tools/filesystem.js');
  return getFileInfo(args);
}

async function handleChangePermissions(args: any) {
  const { changePermissions } = await import('./tools/filesystem.js');
  return changePermissions(args);
}

async function handleSearchFiles(args: any) {
  const { searchFiles } = await import('./tools/filesystem.js');
  return searchFiles(args);
}

async function handleCompressFile(args: any) {
  const { compressFile } = await import('./tools/filesystem.js');
  return compressFile(args);
}

async function handleExtractFile(args: any) {
  const { extractFile } = await import('./tools/filesystem.js');
  return extractFile(args);
}

async function handleCalculateHash(args: any) {
  const { calculateHash } = await import('./tools/filesystem.js');
  return calculateHash(args);
}

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

      // Heartbeat to keep connection alive (every 30 seconds)
      const heartbeat = setInterval(() => {
        res.write('data: {"type": "heartbeat", "timestamp": ' + Date.now() + '}\n\n');
      }, 30000);

      req.on('close', () => {
        clearInterval(heartbeat);
        console.error('SSE connection closed');
      });

      req.on('error', (err) => {
        clearInterval(heartbeat);
        console.error('SSE connection error:', err);
      });
    });

    // POST endpoint for sending messages
    app.post('/mcp', async (req, res) => {
      try {
        // Manual JSON-RPC handling
        const { id, method, params } = req.body;

        let result;
        if (method === 'tools/list') {
          result = {
            tools: [
              { name: 'execute_command', description: 'Execute terminal command safely' },
              { name: 'read_file', description: 'Read file content' },
              { name: 'write_file', description: 'Write or append to file' },
              { name: 'list_directory', description: 'List directory contents' },
              { name: 'get_system_info', description: 'Get system information' },
              { name: 'create_file', description: 'Create a new file' },
              { name: 'create_directory', description: 'Create a new directory' },
              { name: 'delete_file', description: 'Delete a file' },
              { name: 'delete_directory', description: 'Delete a directory recursively' },
              { name: 'copy_file', description: 'Copy a file' },
              { name: 'move_file', description: 'Move or rename a file' },
              { name: 'get_file_info', description: 'Get file information' },
              { name: 'change_permissions', description: 'Change file permissions' },
              { name: 'search_files', description: 'Search for files' },
              { name: 'compress_file', description: 'Compress files/directories' },
              { name: 'extract_file', description: 'Extract compressed files' },
              { name: 'calculate_hash', description: 'Calculate file hash' },
            ]
          };
        } else if (method === 'tools/call') {
          const { name, arguments: args } = params;
          switch (name) {
            case 'execute_command':
              result = await handleExecuteCommand(args);
              break;
            case 'read_file':
              result = await handleReadFile(args);
              break;
            case 'write_file':
              result = await handleWriteFile(args);
              break;
            case 'list_directory':
              result = await handleListDirectory(args);
              break;
            case 'get_system_info':
              result = await handleGetSystemInfo(args);
              break;
            case 'create_file':
              result = await handleCreateFile(args);
              break;
            case 'create_directory':
              result = await handleCreateDirectory(args);
              break;
            case 'delete_file':
              result = await handleDeleteFile(args);
              break;
            case 'delete_directory':
              result = await handleDeleteDirectory(args);
              break;
            case 'copy_file':
              result = await handleCopyFile(args);
              break;
            case 'move_file':
              result = await handleMoveFile(args);
              break;
            case 'get_file_info':
              result = await handleGetFileInfo(args);
              break;
            case 'change_permissions':
              result = await handleChangePermissions(args);
              break;
            case 'search_files':
              result = await handleSearchFiles(args);
              break;
            case 'compress_file':
              result = await handleCompressFile(args);
              break;
            case 'extract_file':
              result = await handleExtractFile(args);
              break;
            case 'calculate_hash':
              result = await handleCalculateHash(args);
              break;
            default:
              throw new Error(`Unknown tool: ${name}`);
          }
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