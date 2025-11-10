import os from 'os';

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

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(info, null, 2)
      }]
    };
  } catch (error: any) {
    throw new Error(`Failed to get system info: ${error.message}`);
  }
}