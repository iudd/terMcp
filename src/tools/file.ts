import fs from 'fs/promises';
import path from 'path';

export async function readFile(args: {
  path: string;
  encoding?: string;
}) {
  const { path: filePath, encoding = 'utf8' } = args;

  try {
    // Security check - prevent directory traversal
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(process.cwd())) {
      throw new Error('Access denied: path outside allowed directory');
    }

    const content = await fs.readFile(resolvedPath, encoding);
    return {
      content: [{ type: 'text', text: content }]
    };
  } catch (error: any) {
    throw new Error(`Failed to read file: ${error.message}`);
  }
}

export async function writeFile(args: {
  path: string;
  content: string;
  encoding?: string;
  append?: boolean;
}) {
  const { path: filePath, content, encoding = 'utf8', append = false } = args;

  try {
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(process.cwd())) {
      throw new Error('Access denied: path outside allowed directory');
    }

    if (append) {
      await fs.appendFile(resolvedPath, content, encoding);
    } else {
      await fs.writeFile(resolvedPath, content, encoding);
    }

    return {
      content: [{ type: 'text', text: `File ${append ? 'appended' : 'written'} successfully` }]
    };
  } catch (error: any) {
    throw new Error(`Failed to write file: ${error.message}`);
  }
}

export async function listDirectory(args: {
  path: string;
  recursive?: boolean;
}) {
  const { path: dirPath, recursive = false } = args;

  try {
    const resolvedPath = path.resolve(dirPath);
    if (!resolvedPath.startsWith(process.cwd())) {
      throw new Error('Access denied: path outside allowed directory');
    }

    const items = await fs.readdir(resolvedPath, { withFileTypes: true });
    const result = items.map(item => ({
      name: item.name,
      type: item.isDirectory() ? 'directory' : 'file',
      path: path.join(resolvedPath, item.name)
    }));

    if (recursive) {
      for (const item of items) {
        if (item.isDirectory()) {
          const subItems = await listDirectory({
            path: path.join(dirPath, item.name),
            recursive: true
          });
          result.push(...(subItems.content[0].text as any));
        }
      }
    }

    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  } catch (error: any) {
    throw new Error(`Failed to list directory: ${error.message}`);
  }
}