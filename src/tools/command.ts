import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

// Whitelist of allowed commands for security
const ALLOWED_COMMANDS = new Set([
  'ls', 'cat', 'grep', 'find', 'head', 'tail', 'wc', 'sort', 'uniq',
  'echo', 'pwd', 'date', 'whoami', 'id', 'ps', 'top', 'df', 'du',
  'curl', 'wget', 'ping', 'traceroute', 'nslookup', 'dig'
]);

export async function executeCommand(args: {
  command: string;
  args?: string[];
  timeout?: number;
}) {
  const { command, args: cmdArgs = [], timeout = 30000 } = args;

  // Security check
  if (!ALLOWED_COMMANDS.has(command)) {
    throw new Error(`Command '${command}' is not allowed`);
  }

  // Sanitize arguments
  const sanitizedArgs = cmdArgs.map(arg => arg.replace(/[<>&|;]/g, ''));

  const fullCommand = [command, ...sanitizedArgs].join(' ');

  try {
    const { stdout, stderr } = await execAsync(fullCommand, {
      timeout,
      maxBuffer: 1024 * 1024, // 1MB buffer
      cwd: process.cwd(),
      env: { ...process.env, PATH: process.env.PATH }
    });

    return {
      content: [
        { type: 'text', text: `Command executed successfully:\n${stdout}` },
        ...(stderr ? [{ type: 'text', text: `Stderr:\n${stderr}` }] : [])
      ]
    };
  } catch (error: any) {
    if (error.code === 'ETIMEDOUT') {
      throw new Error(`Command timed out after ${timeout}ms`);
    }
    throw new Error(`Command failed: ${error.message}`);
  }
}