// attacker.js
const net = require('net');

const TARGET_IP = '127.0.0.1'; // Your server IP
const TARGET_PORT = 3000;      // Your server port
const CONNECTIONS = 15;        // Exceed ATTACK_THRESHOLD

for (let i = 0; i < CONNECTIONS; i++) {
    const client = new net.Socket();
    client.connect(TARGET_PORT, TARGET_IP, () => {
        console.log(`Connection ${i + 1} established`);
    });
    client.on('error', (err) => console.error(`Connection ${i + 1} error:`, err.message));
    setTimeout(() => client.destroy(), 10000); // Keep open for 10 seconds
}