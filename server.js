const express = require('express');
const si = require('systeminformation');

const app = express();
app.use(express.static(__dirname));
app.use(express.json());

let devices = new Map();
let rules = [];
let alerts = [];
let attacks = [];
let trafficHistory = { incoming: [], outgoing: [] };
const HISTORY_SIZE = 20;
const ATTACK_THRESHOLD = 10; // Number of connections from same IP to flag as potential attack

async function updateDeviceStats() {
    try {
        const connections = await si.networkConnections();
        const netStats = await si.networkStats();

        devices.clear();

        connections.forEach(conn => {
            const remoteAddress = conn.remoteAddress || (conn.peer && conn.peer.address);
            const remotePort = conn.remotePort || (conn.peer && conn.peer.port);

            if (conn.state === 'ESTABLISHED' && remoteAddress) {
                const deviceId = `${remoteAddress}:${remotePort}`;
                if (!devices.has(deviceId)) {
                    devices.set(deviceId, {
                        ip: remoteAddress,
                        port: remotePort || 'N/A',
                        bytesIn: 0,
                        bytesOut: 0,
                        lastSeen: Date.now(),
                        protocol: conn.protocol || 'unknown',
                        connectionCount: 1
                    });
                } else {
                    const device = devices.get(deviceId);
                    device.connectionCount = (device.connectionCount || 0) + 1;
                }
            }
        });

        netStats.forEach(stat => {
            const totalBytesIn = stat.rx_bytes;
            const totalBytesOut = stat.tx_bytes;
            const deviceCount = devices.size || 1;
            devices.forEach(device => {
                device.bytesIn = totalBytesIn / deviceCount;
                device.bytesOut = totalBytesOut / deviceCount;
            });
        });

        checkRules();
        detectAnomalies();
        detectAttacks();
    } catch (error) {
        console.error('Error updating device stats:', error);
    }
}

setInterval(updateDeviceStats, 1000);

function checkRules() {
    const networkData = { incoming: 0, outgoing: 0 };
    devices.forEach(device => {
        networkData.incoming += device.bytesIn * 8 / 1000;
        networkData.outgoing += device.bytesOut * 8 / 1000;
    });

    rules.forEach(rule => {
        const [metric, operator, value] = rule.condition.split(' ');
        const numValue = parseFloat(value);
        const currentValue = networkData[metric];

        let isViolated = false;
        switch (operator) {
            case '>': isViolated = currentValue > numValue; break;
            case '<': isViolated = currentValue < numValue; break;
            case '=': isViolated = currentValue === numValue; break;
            case '>=': isViolated = currentValue >= numValue; break;
            case '<=': isViolated = currentValue <= numValue; break;
        }

        if (isViolated) {
            const mitigation = metric === 'incoming' ?
                "Reduce incoming traffic by blocking suspicious IPs or limiting bandwidth." :
                "Check for unauthorized uploads or malware causing high outgoing traffic.";
            alerts.unshift({
                timestamp: new Date().toLocaleString(),
                message: `${rule.name} violated: ${metric} ${operator} ${value} (Current: ${currentValue.toFixed(2)} Kbps)`,
                mitigation
            });
            if (alerts.length > 50) alerts.pop();
        }
    });
}

async function detectAnomalies() {
    let networkData = { incoming: 0, outgoing: 0 };

    try {
        const stats1 = await si.networkStats();
        await new Promise(resolve => setTimeout(resolve, 1000));
        const stats2 = await si.networkStats();

        const ifaceName = stats1.reduce((prev, curr) => {
            return (curr.rx_bytes + curr.tx_bytes) > (prev.rx_bytes + prev.tx_bytes) ? curr : prev;
        }, stats1[0]).iface;

        const stat1 = stats1.find(iface => iface.iface === ifaceName);
        const stat2 = stats2.find(iface => iface.iface === ifaceName);

        if (!stat1 || !stat2) throw new Error(`Network interface ${ifaceName} not found`);

        const rxBytesDiff = stat2.rx_bytes - stat1.rx_bytes;
        const txBytesDiff = stat2.tx_bytes - stat1.tx_bytes;
        const timeDiff = 1;

        const rxSec = rxBytesDiff / timeDiff;
        const txSec = txBytesDiff / timeDiff;

        networkData.incoming = (rxSec * 8 / 1000);
        networkData.outgoing = (txSec * 8 / 1000);
    } catch (error) {
        console.error('Error calculating network traffic:', error);
    }

    trafficHistory.incoming.push(networkData.incoming);
    trafficHistory.outgoing.push(networkData.outgoing);
    if (trafficHistory.incoming.length > HISTORY_SIZE) {
        trafficHistory.incoming.shift();
        trafficHistory.outgoing.shift();
    }

    const calcStats = (data) => {
        const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
        const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
        return { mean, stdDev: Math.sqrt(variance) };
    };

    if (trafficHistory.incoming.length >= HISTORY_SIZE) {
        const incomingStats = calcStats(trafficHistory.incoming);
        const outgoingStats = calcStats(trafficHistory.outgoing);

        const incomingThresholdUpper = incomingStats.mean + 1.5 * incomingStats.stdDev;
        const outgoingThresholdUpper = outgoingStats.mean + 1.5 * outgoingStats.stdDev;

        if (networkData.incoming > incomingThresholdUpper) {
            alerts.unshift({
                timestamp: new Date().toLocaleString(),
                message: `Anomaly detected: Incoming traffic ${networkData.incoming.toFixed(2)} Kbps (Baseline: ${incomingStats.mean.toFixed(2)} Kbps)`,
                mitigation: "Investigate potential DDoS attack or block excessive incoming connections."
            });
        }
        if (networkData.outgoing > outgoingThresholdUpper) {
            alerts.unshift({
                timestamp: new Date().toLocaleString(),
                message: `Anomaly detected: Outgoing traffic ${networkData.outgoing.toFixed(2)} Kbps (Baseline: ${outgoingStats.mean.toFixed(2)} Kbps)`,
                mitigation: "Scan for malware or unauthorized data exfiltration."
            });
        }

        if (alerts.length > 50) alerts.pop();
    }
}

function detectAttacks() {
    const ipConnectionCount = {};
    devices.forEach(device => {
        ipConnectionCount[device.ip] = (ipConnectionCount[device.ip] || 0) + (device.connectionCount || 1);
        if (ipConnectionCount[device.ip] > ATTACK_THRESHOLD) {
            attacks.unshift({
                timestamp: new Date().toLocaleString(),
                message: `Potential port scan detected from ${device.ip}: ${ipConnectionCount[device.ip]} connections`,
                mitigation: `Block IP ${device.ip} or investigate for malicious activity.`
            });
            alerts.unshift({
                timestamp: new Date().toLocaleString(),
                message: `Potential attack: ${ipConnectionCount[device.ip]} connections from ${device.ip}`,
                mitigation: `Block IP ${device.ip} or investigate for malicious activity.`
            });
            if (attacks.length > 50) attacks.pop();
            if (alerts.length > 50) alerts.pop();
        }
    });
}

app.get('/metrics', async (req, res) => {
    try {
        const cpu = await si.currentLoad();
        const mem = await si.mem();
        res.json({
            cpu: cpu.currentLoad.toFixed(2),
            memory: ((mem.used / mem.total) * 100).toFixed(2),
            uptime: formatUptime(si.time().uptime)
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch metrics' });
    }
});

app.get('/network', async (req, res) => {
    try {
        const stats1 = await si.networkStats();
        await new Promise(resolve => setTimeout(resolve, 1000));
        const stats2 = await si.networkStats();

        const ifaceName = stats1.reduce((prev, curr) => {
            return (curr.rx_bytes + curr.tx_bytes) > (prev.rx_bytes + prev.tx_bytes) ? curr : prev;
        }, stats1[0]).iface;

        const stat1 = stats1.find(iface => iface.iface === ifaceName);
        const stat2 = stats2.find(iface => iface.iface === ifaceName);

        if (!stat1 || !stat2) throw new Error(`Network interface ${ifaceName} not found`);

        const rxBytesDiff = stat2.rx_bytes - stat1.rx_bytes;
        const txBytesDiff = stat2.tx_bytes - stat1.tx_bytes;
        const timeDiff = 1;

        res.json({
            incoming: (rxBytesDiff * 8 / 1000 / timeDiff).toFixed(2),
            outgoing: (txBytesDiff * 8 / 1000 / timeDiff).toFixed(2)
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch network stats' });
    }
});

app.get('/devices', async (req, res) => {
    try {
        const deviceArray = Array.from(devices.entries()).map(([id, data]) => ({
            id,
            ip: data.ip,
            port: data.port,
            bytesIn: (data.bytesIn * 8 / 1000).toFixed(2),
            bytesOut: (data.bytesOut * 8 / 1000).toFixed(2),
            protocol: data.protocol,
            lastSeen: new Date(data.lastSeen).toLocaleTimeString()
        }));
        res.json(deviceArray);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch device data' });
    }
});

app.get('/rules', (req, res) => res.json(rules));

app.post('/rules', (req, res) => {
    const { name, condition } = req.body;
    if (!name || !condition) return res.status(400).json({ error: 'Name and condition are required' });
    rules.push({ name, condition });
    res.status(201).json({ message: 'Rule added successfully' });
});

app.delete('/rules/:index', (req, res) => {
    const index = parseInt(req.params.index);
    if (isNaN(index) || index < 0 || index >= rules.length) {
        return res.status(400).json({ error: 'Invalid rule index' });
    }
    rules.splice(index, 1);
    res.status(200).json({ message: 'Rule deleted successfully' });
});

app.get('/intrusions', (req, res) => res.json(alerts.filter(a => a.message.includes('violated'))));

app.get('/anomalies', (req, res) => res.json(alerts.filter(a => a.message.includes('Anomaly'))));

app.get('/alerts', (req, res) => res.json(alerts));

app.get('/attacks', (req, res) => res.json(attacks));

function formatUptime(seconds) {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
}

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));