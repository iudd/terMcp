import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
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
      resources: {},
      logging: {},
    },
  },
);

// Register all tools
registerTools(server);

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'execute_command':
        return await handleExecuteCommand(args);
      case 'read_file':
        return await handleReadFile(args);
      case 'write_file':
        return await handleWriteFile(args);
      case 'list_directory':
        return await handleListDirectory(args);
      case 'get_system_info':
        return await handleGetSystemInfo(args);
      case 'create_file':
        return await handleCreateFile(args);
      case 'create_directory':
        return await handleCreateDirectory(args);
      case 'delete_file':
        return await handleDeleteFile(args);
      case 'delete_directory':
        return await handleDeleteDirectory(args);
      case 'copy_file':
        return await handleCopyFile(args);
      case 'move_file':
        return await handleMoveFile(args);
      case 'get_file_info':
        return await handleGetFileInfo(args);
      case 'change_permissions':
        return await handleChangePermissions(args);
      case 'search_files':
        return await handleSearchFiles(args);
      case 'compress_file':
        return await handleCompressFile(args);
      case 'extract_file':
        return await handleExtractFile(args);
      case 'calculate_hash':
        return await handleCalculateHash(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

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
    // SSE transport for HTTP streaming
    const app = express();
    const port = parseInt(process.env.PORT || '3000');

    app.use(express.json());

    // MCP SSE endpoint
    const sseTransport = new SSEServerTransport('/sse', server);
    app.get('/sse', async (req, res) => {
      await sseTransport.handleRequest(req, res);
    });

    // MCP HTTP POST endpoint for messages
    app.post('/mcp', async (req, res) => {
      try {
        const response = await sseTransport.handleMessage(req.body);
        res.json(response);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    app.listen(port, () => {
      console.error(`TerMCP server started with SSE transport on port ${port}`);
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