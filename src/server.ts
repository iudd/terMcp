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