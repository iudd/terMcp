import os from 'os';
import fs from 'fs/promises';

export async function getSystemInfo(args: {}) {
  try {
    const info = {
      platform: os.platform(),
      arch: os.arch(),
      release: os.release(),
      hostname: os.hostname(),
      cpus: os.cpus().length,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      uptime: os.uptime(),
      loadAverage: os.loadavg(),
      userInfo: os.userInfo(),
      networkInterfaces: os.networkInterfaces(),
    };

    // Get disk usage (simplified)
    let diskInfo = {};
    try {
      const stats = await fs.statvfs ? fs.statvfs('/') : null; // Not available on all platforms
      if (stats) {
        diskInfo = {
          total: stats.blocks * stats.frsize,
          available: stats.bavail * stats.frsize,
        };
      }
    } catch (e) {
      // Disk info not available
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ ...info, disk: diskInfo }, null, 2)
      }]
    };
  } catch (error: any) {
    throw new Error(`Failed to get system info: ${error.message}`);
  }
}