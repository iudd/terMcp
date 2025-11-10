import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function createFile(args: {
  path: string;
  content?: string;
}) {
  const { path: filePath, content = '' } = args;

  try {
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(process.cwd())) {
      throw new Error('Access denied: path outside allowed directory');
    }

    await fs.writeFile(resolvedPath, content, 'utf8');
    return {
      content: [{ type: 'text', text: 'File created successfully' }]
    };
  } catch (error: any) {
    throw new Error(`Failed to create file: ${error.message}`);
  }
}

export async function createDirectory(args: {
  path: string;
  recursive?: boolean;
}) {
  const { path: dirPath, recursive = false } = args;

  try {
    const resolvedPath = path.resolve(dirPath);
    if (!resolvedPath.startsWith(process.cwd())) {
      throw new Error('Access denied: path outside allowed directory');
    }

    await fs.mkdir(resolvedPath, { recursive });
    return {
      content: [{ type: 'text', text: 'Directory created successfully' }]
    };
  } catch (error: any) {
    throw new Error(`Failed to create directory: ${error.message}`);
  }
}

export async function deleteFile(args: {
  path: string;
}) {
  const { path: filePath } = args;

  try {
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(process.cwd())) {
      throw new Error('Access denied: path outside allowed directory');
    }

    await fs.unlink(resolvedPath);
    return {
      content: [{ type: 'text', text: 'File deleted successfully' }]
    };
  } catch (error: any) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

export async function deleteDirectory(args: {
  path: string;
}) {
  const { path: dirPath } = args;

  try {
    const resolvedPath = path.resolve(dirPath);
    if (!resolvedPath.startsWith(process.cwd())) {
      throw new Error('Access denied: path outside allowed directory');
    }

    await fs.rm(resolvedPath, { recursive: true, force: true });
    return {
      content: [{ type: 'text', text: 'Directory deleted successfully' }]
    };
  } catch (error: any) {
    throw new Error(`Failed to delete directory: ${error.message}`);
  }
}

export async function copyFile(args: {
  source: string;
  destination: string;
}) {
  const { source, destination } = args;

  try {
    const resolvedSource = path.resolve(source);
    const resolvedDest = path.resolve(destination);

    if (!resolvedSource.startsWith(process.cwd()) || !resolvedDest.startsWith(process.cwd())) {
      throw new Error('Access denied: path outside allowed directory');
    }

    await fs.copyFile(resolvedSource, resolvedDest);
    return {
      content: [{ type: 'text', text: 'File copied successfully' }]
    };
  } catch (error: any) {
    throw new Error(`Failed to copy file: ${error.message}`);
  }
}

export async function moveFile(args: {
  source: string;
  destination: string;
}) {
  const { source, destination } = args;

  try {
    const resolvedSource = path.resolve(source);
    const resolvedDest = path.resolve(destination);

    if (!resolvedSource.startsWith(process.cwd()) || !resolvedDest.startsWith(process.cwd())) {
      throw new Error('Access denied: path outside allowed directory');
    }

    await fs.rename(resolvedSource, resolvedDest);
    return {
      content: [{ type: 'text', text: 'File moved successfully' }]
    };
  } catch (error: any) {
    throw new Error(`Failed to move file: ${error.message}`);
  }
}

export async function getFileInfo(args: {
  path: string;
}) {
  const { path: filePath } = args;

  try {
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(process.cwd())) {
      throw new Error('Access denied: path outside allowed directory');
    }

    const stats = await fs.stat(resolvedPath);
    const info = {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      accessed: stats.atime,
      isDirectory: stats.isDirectory(),
      isFile: stats.isFile(),
      permissions: stats.mode.toString(8),
    };

    return {
      content: [{ type: 'text', text: JSON.stringify(info, null, 2) }]
    };
  } catch (error: any) {
    throw new Error(`Failed to get file info: ${error.message}`);
  }
}

export async function changePermissions(args: {
  path: string;
  mode: string;
}) {
  const { path: filePath, mode } = args;

  try {
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(process.cwd())) {
      throw new Error('Access denied: path outside allowed directory');
    }

    const numericMode = parseInt(mode, 8);
    await fs.chmod(resolvedPath, numericMode);
    return {
      content: [{ type: 'text', text: 'Permissions changed successfully' }]
    };
  } catch (error: any) {
    throw new Error(`Failed to change permissions: ${error.message}`);
  }
}

export async function searchFiles(args: {
  path: string;
  pattern: string;
  recursive?: boolean;
}) {
  const { path: dirPath, pattern, recursive = true } = args;

  try {
    const resolvedPath = path.resolve(dirPath);
    if (!resolvedPath.startsWith(process.cwd())) {
      throw new Error('Access denied: path outside allowed directory');
    }

    // Simple glob-like search (basic implementation)
    const results: string[] = [];

    async function search(dir: string) {
      const items = await fs.readdir(dir, { withFileTypes: true });
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory() && recursive) {
          await search(fullPath);
        } else if (item.isFile()) {
          // Simple pattern matching
          if (pattern.includes('*')) {
            const regex = new RegExp(pattern.replace(/\*/g, '.*'));
            if (regex.test(item.name)) {
              results.push(fullPath);
            }
          } else if (item.name.includes(pattern)) {
            results.push(fullPath);
          }
        }
      }
    }

    await search(resolvedPath);
    return {
      content: [{ type: 'text', text: JSON.stringify(results, null, 2) }]
    };
  } catch (error: any) {
    throw new Error(`Failed to search files: ${error.message}`);
  }
}

export async function compressFile(args: {
  source: string;
  destination: string;
  format?: string;
}) {
  const { source, destination, format = 'zip' } = args;

  try {
    const resolvedSource = path.resolve(source);
    const resolvedDest = path.resolve(destination);

    if (!resolvedSource.startsWith(process.cwd()) || !resolvedDest.startsWith(process.cwd())) {
      throw new Error('Access denied: path outside allowed directory');
    }

    // Use system commands for compression
    let command: string;
    if (format === 'zip') {
      command = `zip -r "${resolvedDest}" "${resolvedSource}"`;
    } else if (format === 'tar') {
      command = `tar -czf "${resolvedDest}.tar.gz" -C "${path.dirname(resolvedSource)}" "${path.basename(resolvedSource)}"`;
    } else {
      throw new Error(`Unsupported format: ${format}`);
    }

    await execAsync(command);
    return {
      content: [{ type: 'text', text: 'File compressed successfully' }]
    };
  } catch (error: any) {
    throw new Error(`Failed to compress file: ${error.message}`);
  }
}

export async function extractFile(args: {
  source: string;
  destination: string;
}) {
  const { source, destination } = args;

  try {
    const resolvedSource = path.resolve(source);
    const resolvedDest = path.resolve(destination);

    if (!resolvedSource.startsWith(process.cwd()) || !resolvedDest.startsWith(process.cwd())) {
      throw new Error('Access denied: path outside allowed directory');
    }

    // Use system commands for extraction
    let command: string;
    if (resolvedSource.endsWith('.zip')) {
      command = `unzip "${resolvedSource}" -d "${resolvedDest}"`;
    } else if (resolvedSource.endsWith('.tar.gz') || resolvedSource.endsWith('.tgz')) {
      command = `tar -xzf "${resolvedSource}" -C "${resolvedDest}"`;
    } else {
      throw new Error('Unsupported archive format');
    }

    await execAsync(command);
    return {
      content: [{ type: 'text', text: 'File extracted successfully' }]
    };
  } catch (error: any) {
    throw new Error(`Failed to extract file: ${error.message}`);
  }
}

export async function calculateHash(args: {
  path: string;
  algorithm?: string;
}) {
  const { path: filePath, algorithm = 'sha256' } = args;

  try {
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(process.cwd())) {
      throw new Error('Access denied: path outside allowed directory');
    }

    const fileBuffer = await fs.readFile(resolvedPath);
    const hash = crypto.createHash(algorithm).update(fileBuffer).digest('hex');

    return {
      content: [{ type: 'text', text: `${algorithm.toUpperCase()}: ${hash}` }]
    };
  } catch (error: any) {
    throw new Error(`Failed to calculate hash: ${error.message}`);
  }
}