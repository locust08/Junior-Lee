const { spawn } = require('child_process');
const net = require('net');

const nodeCommand = process.execPath;
const nextCommand = require.resolve('next/dist/bin/next');

function canListen(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, '127.0.0.1');
  });
}

async function findAvailablePort(startPort) {
  for (let port = startPort; port < startPort + 20; port += 1) {
    if (await canListen(port)) return port;
  }

  throw new Error(`No available booking API port found from ${startPort} to ${startPort + 19}.`);
}

async function main() {
  const preferredPort = Number(process.env.BOOKING_API_PORT || 3001);
  const bookingApiPort = await findAvailablePort(preferredPort);
  const sharedEnv = {
    ...process.env,
    BOOKING_API_PORT: String(bookingApiPort),
  };
  const bookingApiEnv = { ...sharedEnv, PORT: String(bookingApiPort) };
  const nextDevEnv = { ...sharedEnv };
  delete nextDevEnv.PORT;

  if (bookingApiPort !== preferredPort) {
    console.log(
      `Port ${preferredPort} is already in use. Using booking API port ${bookingApiPort} instead.`,
    );
  }

  const bookingApi = spawn(nodeCommand, ['booking-server.js'], {
    cwd: process.cwd(),
    env: bookingApiEnv,
    stdio: 'inherit',
  });

  const nextDev = spawn(nodeCommand, [nextCommand, 'dev'], {
    cwd: process.cwd(),
    env: nextDevEnv,
    stdio: 'inherit',
  });

  let shuttingDown = false;

  function stop(exitCode = 0) {
    if (shuttingDown) return;
    shuttingDown = true;

    if (!bookingApi.killed) bookingApi.kill();
    if (!nextDev.killed) nextDev.kill();
    process.exitCode = exitCode;
  }

  bookingApi.on('error', (error) => {
    console.error('Unable to start the booking API:', error);
    stop(1);
  });

  nextDev.on('error', (error) => {
    console.error('Unable to start Next.js:', error);
    stop(1);
  });

  bookingApi.on('exit', (code) => {
    if (!shuttingDown && code) stop(code);
  });

  nextDev.on('exit', (code) => {
    stop(code || 0);
  });

  process.on('SIGINT', () => stop(0));
  process.on('SIGTERM', () => stop(0));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
