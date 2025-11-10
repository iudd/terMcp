import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

export function registerTools(server: Server) {
  // Register tool list handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'execute_command',
          description: 'Execute terminal command safely',
          inputSchema: {
            type: 'object',
            properties: {
              command: { type: 'string', description: 'Command to execute' },
              args: { type: 'array', items: { type: 'string' }, description: 'Command arguments' },
              timeout: { type: 'number', default: 30000, description: 'Timeout in milliseconds' },
            },
            required: ['command'],
          },
        },
        {
          name: 'read_file',
          description: 'Read file content',
          inputSchema: {
            type: 'object',
            properties: {
              path: { type: 'string', description: 'File path to read' },
              encoding: { type: 'string', default: 'utf8', description: 'File encoding' },
            },
            required: ['path'],
          },
        },
        {
          name: 'write_file',
          description: 'Write content to file',
          inputSchema: {
            type: 'object',
            properties: {
              path: { type: 'string', description: 'File path to write' },
              content: { type: 'string', description: 'Content to write' },
              encoding: { type: 'string', default: 'utf8', description: 'File encoding' },
              append: { type: 'boolean', default: false, description: 'Append to file instead of overwrite' },
            },
            required: ['path', 'content'],
          },
        },
        {
          name: 'list_directory',
          description: 'List directory contents',
          inputSchema: {
            type: 'object',
            properties: {
              path: { type: 'string', description: 'Directory path to list' },
              recursive: { type: 'boolean', default: false, description: 'List recursively' },
            },
            required: ['path'],
          },
        },
        {
          name: 'get_system_info',
          description: 'Get system information',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'create_file',
          description: 'Create a new file',
          inputSchema: {
            type: 'object',
            properties: {
              path: { type: 'string', description: 'File path to create' },
              content: { type: 'string', default: '', description: 'Initial content' },
            },
            required: ['path'],
          },
        },
        {
          name: 'create_directory',
          description: 'Create a new directory',
          inputSchema: {
            type: 'object',
            properties: {
              path: { type: 'string', description: 'Directory path to create' },
              recursive: { type: 'boolean', default: false, description: 'Create parent directories' },
            },
            required: ['path'],
          },
        },
        {
          name: 'delete_file',
          description: 'Delete a file',
          inputSchema: {
            type: 'object',
            properties: {
              path: { type: 'string', description: 'File path to delete' },
            },
            required: ['path'],
          },
        },
        {
          name: 'delete_directory',
          description: 'Delete a directory recursively',
          inputSchema: {
            type: 'object',
            properties: {
              path: { type: 'string', description: 'Directory path to delete' },
            },
            required: ['path'],
          },
        },
        {
          name: 'copy_file',
          description: 'Copy a file',
          inputSchema: {
            type: 'object',
            properties: {
              source: { type: 'string', description: 'Source file path' },
              destination: { type: 'string', description: 'Destination file path' },
            },
            required: ['source', 'destination'],
          },
        },
        {
          name: 'move_file',
          description: 'Move or rename a file',
          inputSchema: {
            type: 'object',
            properties: {
              source: { type: 'string', description: 'Source file path' },
              destination: { type: 'string', description: 'Destination file path' },
            },
            required: ['source', 'destination'],
          },
        },
        {
          name: 'get_file_info',
          description: 'Get file information',
          inputSchema: {
            type: 'object',
            properties: {
              path: { type: 'string', description: 'File path to get info' },
            },
            required: ['path'],
          },
        },
        {
          name: 'change_permissions',
          description: 'Change file permissions',
          inputSchema: {
            type: 'object',
            properties: {
              path: { type: 'string', description: 'File path to change permissions' },
              mode: { type: 'string', description: 'Permission mode (octal string)' },
            },
            required: ['path', 'mode'],
          },
        },
        {
          name: 'search_files',
          description: 'Search for files in directory',
          inputSchema: {
            type: 'object',
            properties: {
              path: { type: 'string', description: 'Directory to search in' },
              pattern: { type: 'string', description: 'Search pattern (glob or regex)' },
              recursive: { type: 'boolean', default: true, description: 'Search recursively' },
            },
            required: ['path', 'pattern'],
          },
        },
        {
          name: 'compress_file',
          description: 'Compress files or directories',
          inputSchema: {
            type: 'object',
            properties: {
              source: { type: 'string', description: 'Source path to compress' },
              destination: { type: 'string', description: 'Destination archive path' },
              format: { type: 'string', enum: ['zip', 'tar', 'gz'], default: 'zip', description: 'Archive format' },
            },
            required: ['source', 'destination'],
          },
        },
        {
          name: 'extract_file',
          description: 'Extract compressed files',
          inputSchema: {
            type: 'object',
            properties: {
              source: { type: 'string', description: 'Archive file to extract' },
              destination: { type: 'string', description: 'Destination directory' },
            },
            required: ['source', 'destination'],
          },
        },
        {
          name: 'calculate_hash',
          description: 'Calculate file hash',
          inputSchema: {
            type: 'object',
            properties: {
              path: { type: 'string', description: 'File path to hash' },
              algorithm: { type: 'string', enum: ['md5', 'sha1', 'sha256'], default: 'sha256', description: 'Hash algorithm' },
            },
            required: ['path'],
          },
        },
      ],
    };
  });
}