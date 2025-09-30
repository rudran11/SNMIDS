

// Submenu Options
const options = {
    network: ["Performance Metrics", "Real-Time Visualization", "Device-Wise Monitoring"],
    intrusion: ["Rule-Based Detection", "Anomaly Detection", "Detailed Log"],
    alerts: ["Real-Time Alerts", "Mitigation Suggestion"],
    dashboard: ["Interactive Interface", "Graphs and Tables", "Custom Rules"],
    security: ["Traffic Monitoring", "Attack Detection"]
};

// Show Submenu with Animation
function showSubMenu(category) {
    const submenu = document.getElementById("submenu");
    const content = document.getElementById("content");
    content.innerHTML = "";
    submenu.innerHTML = "<h3 class='animate__animated animate__fadeIn'>Select an Option:</h3>";

    options[category].forEach((topic, index) => {
        const btn = document.createElement("button");
        btn.innerText = topic;
        btn.className = "animate__animated animate__fadeInUp";
        btn.style.animationDelay = `${index * 0.1}s`;
        btn.onclick = () => showDetails(topic);
        submenu.appendChild(btn);
    });
}

// Live Visualization Variables
let visualizationInterval = null;
let trafficChart = null;
let performanceInterval = null;
let deviceInterval = null;
let deviceChart = null;
let anomalyInterval = null;
let alertInterval = null;
let dashboardInterval = null;
let securityInterval = null;

// Show Details with Enhanced Content
function showDetails(topic) {
    const content = document.getElementById("content");
    content.innerHTML = "";

    // Clear existing intervals and charts
    if (visualizationInterval) clearInterval(visualizationInterval);
    if (trafficChart) trafficChart.destroy();
    if (performanceInterval) clearInterval(performanceInterval);
    if (deviceInterval) clearInterval(deviceInterval);
    if (deviceChart) deviceChart.destroy();
    if (anomalyInterval) clearInterval(anomalyInterval);
    if (alertInterval) clearInterval(alertInterval);
    if (dashboardInterval) clearInterval(dashboardInterval);
    if (securityInterval) clearInterval(securityInterval);

    const details = {
        "Performance Metrics": () => fetchPerformanceMetrics(),
        "Real-Time Visualization": () => fetchRealTimeVisualization(),
        "Device-Wise Monitoring": () => fetchDeviceMonitoring(),
        "Rule-Based Detection": () => fetchRuleBasedDetection(),
        "Anomaly Detection": () => fetchAnomalyDetection(),
        "Detailed Log": () => fetchDetailedLog(),
        "Real-Time Alerts": () => fetchRealTimeAlerts(),
        "Mitigation Suggestion": () => fetchMitigationSuggestions(),
        "Interactive Interface": () => fetchInteractiveDashboard(),
        "Graphs and Tables": () => fetchGraphsAndTables(),
        "Custom Rules": () => fetchCustomRules(),
        "Traffic Monitoring": () => fetchTrafficMonitoring(),
        "Attack Detection": () => fetchAttackDetection()
    };

    if (typeof details[topic] === "function") {
        details[topic]();
    } else {
        content.innerHTML = details[topic];
    }
}

// Simulate Live System Performance Metrics
function fetchPerformanceMetrics() {
    const content = document.getElementById("content");

    async function updateMetrics() {
        try {
            const response = await fetch('http://localhost:3000/metrics');
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();

            const timestamp = new Date().toLocaleTimeString();
            content.innerHTML = `
                <div class="alert alert-success live-metrics animate__animated animate__fadeIn">
                    <div class="timestamp">Last Updated: ${timestamp}</div>
                    <h5>Live System Metrics</h5>
                    <p><i class="fas fa-microchip metric-icon"></i> CPU Usage: ${data.cpu}%</p>
                    <div class="progress mb-2" style="height: 8px;">
                        <div class="progress-bar bg-info" style="width: ${data.cpu}%;"></div>
                    </div>
                    <p><i class="fas fa-memory metric-icon"></i> Memory Usage: ${data.memory}%</p>
                    <div class="progress mb-2" style="height: 8px;">
                        <div class="progress-bar bg-info" style="width: ${data.memory}%;"></div>
                    </div>
                    <p><i class="fas fa-clock metric-icon"></i> Uptime: ${data.uptime}</p>
                </div>
            `;
        } catch (error) {
            content.innerHTML = `
                <div class="alert alert-danger animate__animated animate__fadeIn">
                    <h5>Error</h5>
                    <p>Failed to fetch performance metrics. Ensure the server is running.</p>
                </div>
            `;
        }
    }

    updateMetrics();
    performanceInterval = setInterval(updateMetrics, 1000);
}

// Real-Time Visualization
function fetchRealTimeVisualization() {
    const content = document.getElementById("content");

    content.innerHTML = `
        <div class="alert alert-info live-visualization animate__animated animate__fadeIn">
            <div class="timestamp" id="visualization-timestamp"></div>
            <h5>Real-Time Network Traffic Visualization</h5>
            <div class="chart-container">
                <canvas id="trafficChart"></canvas>
            </div>
            <div id="no-activity-message" style="display: none; text-align: center; margin-top: 10px; color: #ffcc00;">
                Minimal network activity detected. Try streaming a video or downloading a file.
            </div>
        </div>
    `;

    setTimeout(() => {
        const ctx = document.getElementById("trafficChart").getContext("2d");
        const labels = [];
        const incomingData = [];
        const outgoingData = [];
        const maxDataPoints = 20;

        trafficChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: "Incoming Traffic (Kbps)",
                        data: incomingData,
                        borderColor: "#0dcaf0",
                        backgroundColor: "rgba(13, 202, 240, 0.2)",
                        fill: true,
                        tension: 0.4,
                    },
                    {
                        label: "Outgoing Traffic (Kbps)",
                        data: outgoingData,
                        borderColor: "#ffffff",
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        fill: true,
                        tension: 0.4,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { title: { display: true, text: "Time" }, ticks: { color: document.body.classList.contains("light-mode") ? "#333333" : "#b0b0c0" } },
                    y: { title: { display: true, text: "Traffic (Kbps)" }, beginAtZero: true, suggestedMax: 100 },
                },
            },
        });

        async function updateChart() {
            try {
                const response = await fetch('http://localhost:3000/network');
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const data = await response.json();

                const timestamp = new Date().toLocaleTimeString();
                document.getElementById("visualization-timestamp").innerText = `Last Updated: ${timestamp}`;

                const timeLabel = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                labels.push(timeLabel);
                incomingData.push(parseFloat(data.incoming) || 0);
                outgoingData.push(parseFloat(data.outgoing) || 0);

                if (labels.length > maxDataPoints) {
                    labels.shift();
                    incomingData.shift();
                    outgoingData.shift();
                }

                const maxTraffic = Math.max(...incomingData, ...outgoingData, 10);
                trafficChart.options.scales.y.suggestedMax = Math.ceil(maxTraffic * 1.2);
                document.getElementById("no-activity-message").style.display = maxTraffic < 50 ? "block" : "none";

                trafficChart.data.labels = labels;
                trafficChart.data.datasets[0].data = incomingData;
                trafficChart.data.datasets[1].data = outgoingData;
                trafficChart.update();
            } catch (error) {
                content.innerHTML = `
                    <div class="alert alert-danger animate__animated animate__fadeIn">
                        <h5>Error</h5>
                        <p>Failed to fetch network data. Ensure the server is running.</p>
                    </div>
                `;
                clearInterval(visualizationInterval);
            }
        }

        updateChart();
        visualizationInterval = setInterval(updateChart, 3000);
    }, 100);
}

// Device-Wise Monitoring
function fetchDeviceMonitoring() {
    const content = document.getElementById("content");

    content.innerHTML = `
        <div class="alert alert-info live-visualization animate__animated animate__fadeIn">
            <div class="timestamp" id="device-timestamp"></div>
            <h5>Real-Time Device Monitoring</h5>
            <div class="chart-container" id="device-chart-container">
                <canvas id="deviceChart"></canvas>
            </div>
            <div id="device-table" class="mt-3">
                <table class="table table-dark table-striped">
                    <thead>
                        <tr>
                            <th>IP</th>
                            <th>Port</th>
                            <th>Incoming (Kbps)</th>
                            <th>Outgoing (Kbps)</th>
                            <th>Protocol</th>
                            <th>Last Seen</th>
                        </tr>
                    </thead>
                    <tbody id="device-table-body"></tbody>
                </table>
            </div>
            <div id="no-devices-message" style="display: none; text-align: center; margin-top: 20px; color: #ffcc00;">
                No devices are connected. Try opening a network connection.
            </div>
        </div>
    `;

    setTimeout(() => {
        const ctx = document.getElementById("deviceChart").getContext("2d");
        const labels = [];
        const maxDataPoints = 20;

        deviceChart = new Chart(ctx, {
            type: "line",
            data: { labels: labels, datasets: [] },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { title: { display: true, text: "Time" }, ticks: { color: document.body.classList.contains("light-mode") ? "#333333" : "#b0b0c0" } },
                    y: { title: { display: true, text: "Traffic (Kbps)" }, beginAtZero: true, suggestedMax: 100 },
                },
            },
        });

        async function updateDeviceData() {
            try {
                const response = await fetch('http://localhost:3000/devices');
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const devices = await response.json();

                const timestamp = new Date().toLocaleTimeString();
                document.getElementById("device-timestamp").innerText = `Last Updated: ${timestamp}`;

                if (devices.length === 0) {
                    document.getElementById("no-devices-message").style.display = "block";
                    document.getElementById("device-chart-container").style.display = "none";
                    document.getElementById("device-table").style.display = "none";
                } else {
                    document.getElementById("no-devices-message").style.display = "none";
                    document.getElementById("device-chart-container").style.display = "block";
                    document.getElementById("device-table").style.display = "block";

                    document.getElementById("device-table-body").innerHTML = devices.map(device => `
                        <tr>
                            <td>${device.ip}</td>
                            <td>${device.port}</td>
                            <td>${device.bytesIn}</td>
                            <td>${device.bytesOut}</td>
                            <td>${device.protocol}</td>
                            <td>${device.lastSeen}</td>
                        </tr>
                    `).join('');

                    const timeLabel = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                    labels.push(timeLabel);
                    if (labels.length > maxDataPoints) labels.shift();

                    deviceChart.data.datasets = devices.map(device => {
                        const existingDataset = deviceChart.data.datasets.find(d => d.label === `${device.ip}:${device.port}`);
                        const data = existingDataset ? existingDataset.data : [];
                        data.push(parseFloat(device.bytesIn) + parseFloat(device.bytesOut));
                        if (data.length > maxDataPoints) data.shift();

                        return {
                            label: `${device.ip}:${device.port}`,
                            data: data,
                            borderColor: existingDataset ? existingDataset.borderColor : getRandomColor(),
                            fill: false,
                            tension: 0.4
                        };
                    });

                    deviceChart.data.labels = labels;
                    const maxTraffic = Math.max(...deviceChart.data.datasets.flatMap(d => d.data), 10);
                    deviceChart.options.scales.y.suggestedMax = Math.ceil(maxTraffic * 1.2);
                    deviceChart.update();
                }
            } catch (error) {
                content.innerHTML = `
                    <div class="alert alert-danger animate__animated animate__fadeIn">
                        <h5>Error</h5>
                        <p>Failed to fetch device data: ${error.message}</p>
                    </div>
                `;
                clearInterval(deviceInterval);
            }
        }

        function getRandomColor() {
            const letters = '0123456789ABCDEF';
            let color = '#';
            for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
            return color;
        }

        updateDeviceData();
        deviceInterval = setInterval(updateDeviceData, 2000);
    }, 100);
}

// Rule-Based Detection
function fetchRuleBasedDetection() {
    const content = document.getElementById("content");
    content.innerHTML = `
        <div class="alert alert-info animate__animated animate__fadeIn">
            <h5>Rule-Based Detection</h5>
            <p>Create custom rules to detect specific threats and vulnerabilities with precision.</p>
            <div class="rule-form mt-3">
                <h6>Add New Rule</h6>
                <form id="ruleForm">
                    <div class="mb-3">
                        <label for="ruleName" class="form-label">Rule Name</label>
                        <input type="text" class="form-control" id="ruleName" placeholder="e.g., High Traffic Alert" required>
                    </div>
                    <div class="mb-3">
                        <label for="condition" class="form-label">Condition (e.g., incoming > 1000 Kbps)</label>
                        <input type="text" class="form-control" id="condition" placeholder="e.g., incoming > 1000" required>
                    </div>
                    <button type="submit" class="btn btn-primary">Add Rule</button>
                </form>
            </div>
            <div id="rulesList" class="mt-3">
                <h6>Active Rules</h6>
                <ul class="list-group"></ul>
            </div>
            <div id="intrusionLog" class="mt-3">
                <h6>Intrusion Log</h6>
                <ul class="list-group"></ul>
            </div>
        </div>
    `;

    const ruleForm = document.getElementById("ruleForm");
    ruleForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const ruleName = document.getElementById("ruleName").value;
        const condition = document.getElementById("condition").value;

        try {
            const response = await fetch('http://localhost:3000/rules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: ruleName, condition })
            });
            if (!response.ok) throw new Error('Failed to add rule');
            fetchRules();
            ruleForm.reset();
        } catch (error) {
            content.innerHTML += `<div class="alert alert-danger mt-3">Error: ${error.message}</div>`;
        }
    });

    fetchRules();
    fetchIntrusions();
}

// Anomaly Detection
function fetchAnomalyDetection() {
    const content = document.getElementById("content");
    content.innerHTML = `
        <div class="alert alert-info animate__animated animate__fadeIn">
            <h5>Anomaly Detection</h5>
            <p>AI-powered anomaly detection identifies unusual patterns in network traffic.</p>
            <div id="anomalyLog" class="mt-3">
                <h6>Anomaly Log</h6>
                <ul class="list-group"></ul>
            </div>
        </div>
    `;

    async function fetchAnomalies() {
        const anomalyLog = document.querySelector("#anomalyLog .list-group");
        try {
            const response = await fetch('http://localhost:3000/anomalies');
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const anomalies = await response.json();
            anomalyLog.innerHTML = anomalies.map(anomaly => `
                <li class="list-group-item text-warning">${anomaly.timestamp}: ${anomaly.message}</li>
            `).join('');
        } catch (error) {
            anomalyLog.innerHTML = `<li class="list-group-item text-danger">Failed to load anomalies: ${error.message}</li>`;
        }
    }

    fetchAnomalies();
    anomalyInterval = setInterval(fetchAnomalies, 5000);
}

// Detailed Log
function fetchDetailedLog() {
    const content = document.getElementById("content");
    content.innerHTML = `
        <div class="alert alert-info animate__animated animate__fadeIn">
            <h5>Detailed Log</h5>
            <p>Access comprehensive event logs with timestamps, severity levels, and detailed analysis.</p>
            <div id="detailedLog" class="mt-3">
                <h6>Event Log</h6>
                <ul class="list-group"></ul>
            </div>
        </div>
    `;

    async function fetchLogs() {
        const logList = document.querySelector("#detailedLog .list-group");
        try {
            const response = await fetch('http://localhost:3000/alerts');
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const logs = await response.json();
            if (logs.length === 0) {
                logList.innerHTML = `<li class="list-group-item text-muted">No events detected yet.</li>`;
            } else {
                logList.innerHTML = logs.map(log => {
                    const severity = log.message.includes('Anomaly') ? 'High' : 'Medium';
                    return `
                        <li class="list-group-item">
                            <strong>${log.timestamp}</strong>: ${log.message}<br>
                            <span class="text-${severity === 'High' ? 'danger' : 'warning'}">Severity: ${severity}</span>
                        </li>
                    `;
                }).join('');
            }
        } catch (error) {
            logList.innerHTML = `<li class="list-group-item text-danger">Failed to load logs: ${error.message}</li>`;
        }
    }

    fetchLogs();
    alertInterval = setInterval(fetchLogs, 5000);
}

// Real-Time Alerts
function fetchRealTimeAlerts() {
    const content = document.getElementById("content");
    content.innerHTML = `
        <div class="alert alert-info animate__animated animate__fadeIn">
            <h5>Real-Time Alerts</h5>
            <p>Receive instant notifications for critical events.</p>
            <div id="alertLog" class="mt-3">
                <h6>Alert Log</h6>
                <ul class="list-group"></ul>
            </div>
        </div>
    `;

    async function fetchAlerts() {
        const alertLog = document.querySelector("#alertLog .list-group");
        try {
            const response = await fetch('http://localhost:3000/alerts');
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const alerts = await response.json();
            alertLog.innerHTML = alerts.map(alert => `
                <li class="list-group-item text-warning">${alert.timestamp}: ${alert.message}</li>
            `).join('');
            alerts.slice(0, 5).forEach(alert => showToast(alert));
        } catch (error) {
            alertLog.innerHTML = `<li class="list-group-item text-danger">Failed to load alerts: ${error.message}</li>`;
        }
    }

    fetchAlerts();
    alertInterval = setInterval(fetchAlerts, 3000);
}

// Mitigation Suggestions
function fetchMitigationSuggestions() {
    const content = document.getElementById("content");
    content.innerHTML = `
        <div class="alert alert-info animate__animated animate__fadeIn">
            <h5>Mitigation Suggestions</h5>
            <p>Get AI-driven suggestions to mitigate detected threats.</p>
            <div id="mitigationLog" class="mt-3">
                <h6>Mitigation Log</h6>
                <ul class="list-group"></ul>
            </div>
        </div>
    `;

    async function fetchMitigations() {
        const mitigationLog = document.querySelector("#mitigationLog .list-group");
        try {
            const response = await fetch('http://localhost:3000/alerts');
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const alerts = await response.json();
            mitigationLog.innerHTML = alerts.map(alert => `
                <li class="list-group-item">
                    <strong>${alert.timestamp}: ${alert.message}</strong><br>
                    <span class="text-success">Suggestion: ${alert.mitigation}</span>
                </li>
            `).join('');
        } catch (error) {
            mitigationLog.innerHTML = `<li class="list-group-item text-danger">Failed to load mitigations: ${error.message}</li>`;
        }
    }

    fetchMitigations();
    alertInterval = setInterval(fetchMitigations, 3000);
}

// Interactive Dashboard
function fetchInteractiveDashboard() {
    const content = document.getElementById("content");
    content.innerHTML = `
        <div class="dashboard animate__animated animate__fadeIn">
            <h3>Interactive Dashboard</h3>
            <div class="row">
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-header">System Metrics</div>
                        <div class="card-body" id="dashboard-metrics"></div>
                    </div>
                </div>
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-header">Network Traffic</div>
                        <div class="card-body">
                            <div class="chart-container">
                                <canvas id="dashboard-traffic-chart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">Recent Alerts</div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-dark table-striped">
                                    <thead>
                                        <tr>
                                            <th>Timestamp</th>
                                            <th>Message</th>
                                            <th>Mitigation</th>
                                        </tr>
                                    </thead>
                                    <tbody id="dashboard-alerts-table"></tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    let trafficChartInstance = null;

    async function updateDashboard() {
        try {
            // System Metrics
            const metricsResponse = await fetch('http://localhost:3000/metrics');
            if (!metricsResponse.ok) throw new Error('Metrics fetch failed');
            const metrics = await metricsResponse.json();
            document.getElementById("dashboard-metrics").innerHTML = `
                <p><i class="fas fa-microchip"></i> CPU: ${metrics.cpu}%</p>
                <p><i class="fas fa-memory"></i> Memory: ${metrics.memory}%</p>
                <p><i class="fas fa-clock"></i> Uptime: ${metrics.uptime}</p>
            `;

            // Network Traffic Chart
            const networkResponse = await fetch('http://localhost:3000/network');
            if (!networkResponse.ok) throw new Error('Network fetch failed');
            const network = await networkResponse.json();

            if (!trafficChartInstance) {
                const ctx = document.getElementById("dashboard-traffic-chart").getContext("2d");
                trafficChartInstance = new Chart(ctx, {
                    type: "line",
                    data: {
                        labels: [],
                        datasets: [
                            { label: "Incoming (Kbps)", data: [], borderColor: "#0dcaf0", fill: false },
                            { label: "Outgoing (Kbps)", data: [], borderColor: "#ffffff", fill: false }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: { title: { display: true, text: "Time" } },
                            y: { title: { display: true, text: "Traffic (Kbps)" }, beginAtZero: true }
                        }
                    }
                });
            }

            const timeLabel = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
            trafficChartInstance.data.labels.push(timeLabel);
            trafficChartInstance.data.datasets[0].data.push(parseFloat(network.incoming));
            trafficChartInstance.data.datasets[1].data.push(parseFloat(network.outgoing));
            if (trafficChartInstance.data.labels.length > 20) {
                trafficChartInstance.data.labels.shift();
                trafficChartInstance.data.datasets[0].data.shift();
                trafficChartInstance.data.datasets[1].data.shift();
            }
            trafficChartInstance.update();

            // Alerts Table
            const alertsResponse = await fetch('http://localhost:3000/alerts');
            if (!alertsResponse.ok) throw new Error('Alerts fetch failed');
            const alerts = await alertsResponse.json();
            document.getElementById("dashboard-alerts-table").innerHTML = alerts.slice(0, 5).map(alert => `
                <tr>
                    <td>${alert.timestamp}</td>
                    <td>${alert.message}</td>
                    <td>${alert.mitigation}</td>
                </tr>
            `).join('');
        } catch (error) {
            content.innerHTML = `<div class="alert alert-danger">Error loading dashboard: ${error.message}</div>`;
        }
    }

    updateDashboard();
    dashboardInterval = setInterval(updateDashboard, 3000);
}

// Graphs and Tables
function fetchGraphsAndTables() {
    const content = document.getElementById("content");
    content.innerHTML = `
        <div class="dashboard animate__animated animate__fadeIn">
            <h3>Graphs and Tables</h3>
            <div class="row">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">Traffic Graph</div>
                        <div class="card-body">
                            <div class="chart-container">
                                <canvas id="traffic-graph"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">Device Traffic</div>
                        <div class="card-body">
                            <div class="chart-container">
                                <canvas id="device-graph"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">Device Table</div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-dark table-striped">
                                    <thead>
                                        <tr>
                                            <th>IP</th>
                                            <th>Port</th>
                                            <th>Incoming (Kbps)</th>
                                            <th>Outgoing (Kbps)</th>
                                            <th>Protocol</th>
                                            <th>Last Seen</th>
                                        </tr>
                                    </thead>
                                    <tbody id="device-table-body"></tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    let trafficGraph = null;
    let deviceGraph = null;

    async function updateGraphsAndTables() {
        try {
            // Traffic Graph
            const networkResponse = await fetch('http://localhost:3000/network');
            if (!networkResponse.ok) throw new Error('Network fetch failed');
            const network = await networkResponse.json();

            if (!trafficGraph) {
                const ctx = document.getElementById("traffic-graph").getContext("2d");
                trafficGraph = new Chart(ctx, {
                    type: "line",
                    data: {
                        labels: [],
                        datasets: [
                            { label: "Incoming (Kbps)", data: [], borderColor: "#0dcaf0", fill: false },
                            { label: "Outgoing (Kbps)", data: [], borderColor: "#ffffff", fill: false }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: { title: { display: true, text: "Time" } },
                            y: { title: { display: true, text: "Traffic (Kbps)" }, beginAtZero: true }
                        }
                    }
                });
            }

            const timeLabel = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
            trafficGraph.data.labels.push(timeLabel);
            trafficGraph.data.datasets[0].data.push(parseFloat(network.incoming));
            trafficGraph.data.datasets[1].data.push(parseFloat(network.outgoing));
            if (trafficGraph.data.labels.length > 20) {
                trafficGraph.data.labels.shift();
                trafficGraph.data.datasets[0].data.shift();
                trafficGraph.data.datasets[1].data.shift();
            }
            trafficGraph.update();

            // Device Graph and Table
            const devicesResponse = await fetch('http://localhost:3000/devices');
            if (!devicesResponse.ok) throw new Error('Devices fetch failed');
            const devices = await devicesResponse.json();

            if (!deviceGraph) {
                const ctx = document.getElementById("device-graph").getContext("2d");
                deviceGraph = new Chart(ctx, {
                    type: "line",
                    data: { labels: [], datasets: [] },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: { title: { display: true, text: "Time" } },
                            y: { title: { display: true, text: "Traffic (Kbps)" }, beginAtZero: true }
                        }
                    }
                });
            }

            deviceGraph.data.labels.push(timeLabel);
            deviceGraph.data.datasets = devices.map(device => {
                const existingDataset = deviceGraph.data.datasets.find(d => d.label === `${device.ip}:${device.port}`);
                const data = existingDataset ? existingDataset.data : [];
                data.push(parseFloat(device.bytesIn) + parseFloat(device.bytesOut));
                if (data.length > 20) data.shift();
                return {
                    label: `${device.ip}:${device.port}`,
                    data: data,
                    borderColor: existingDataset ? existingDataset.borderColor : getRandomColor(),
                    fill: false
                };
            });
            if (deviceGraph.data.labels.length > 20) deviceGraph.data.labels.shift();
            deviceGraph.update();

            document.getElementById("device-table-body").innerHTML = devices.map(device => `
                <tr>
                    <td>${device.ip}</td>
                    <td>${device.port}</td>
                    <td>${device.bytesIn}</td>
                    <td>${device.bytesOut}</td>
                    <td>${device.protocol}</td>
                    <td>${device.lastSeen}</td>
                </tr>
            `).join('');
        } catch (error) {
            content.innerHTML = `<div class="alert alert-danger">Error loading graphs and tables: ${error.message}</div>`;
        }
    }

    updateGraphsAndTables();
    dashboardInterval = setInterval(updateGraphsAndTables, 3000);
}

// Custom Rules
function fetchCustomRules() {
    const content = document.getElementById("content");
    content.innerHTML = `
        <div class="dashboard animate__animated animate__fadeIn">
            <h3>Custom Rules</h3>
            <div class="card">
                <div class="card-header">Manage Rules</div>
                <div class="card-body">
                    <div class="rule-form mb-3">
                        <h6>Add New Rule</h6>
                        <form id="dashboard-rule-form">
                            <div class="mb-3">
                                <label for="ruleName" class="form-label">Rule Name</label>
                                <input type="text" class="form-control" id="ruleName" placeholder="e.g., High Traffic Alert" required>
                            </div>
                            <div class="mb-3">
                                <label for="condition" class="form-label">Condition (e.g., incoming > 1000 Kbps)</label>
                                <input type="text" class="form-control" id="condition" placeholder="e.g., incoming > 1000" required>
                            </div>
                            <button type="submit" class="btn btn-primary">Add Rule</button>
                        </form>
                    </div>
                    <div id="rules-list">
                        <h6>Active Rules</h6>
                        <ul class="list-group"></ul>
                    </div>
                </div>
            </div>
        </div>
    `;

    const ruleForm = document.getElementById("dashboard-rule-form");
    ruleForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const ruleName = document.getElementById("ruleName").value;
        const condition = document.getElementById("condition").value;

        try {
            const response = await fetch('http://localhost:3000/rules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: ruleName, condition })
            });
            if (!response.ok) throw new Error('Failed to add rule');
            updateRulesList();
            ruleForm.reset();
        } catch (error) {
            content.innerHTML += `<div class="alert alert-danger mt-3">Error: ${error.message}</div>`;
        }
    });

    async function updateRulesList() {
        const rulesList = document.querySelector("#rules-list .list-group");
        try {
            const response = await fetch('http://localhost:3000/rules');
            if (!response.ok) throw new Error('Rules fetch failed');
            const rules = await response.json();
            rulesList.innerHTML = rules.map((rule, index) => `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    ${rule.name}: ${rule.condition}
                    <button class="btn btn-danger btn-sm" onclick="deleteRule(${index})">Delete</button>
                </li>
            `).join('');
        } catch (error) {
            rulesList.innerHTML = `<li class="list-group-item text-danger">Failed to load rules: ${error.message}</li>`;
        }
    }

    window.deleteRule = async (index) => {
        try {
            const response = await fetch(`http://localhost:3000/rules/${index}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete rule');
            updateRulesList();
        } catch (error) {
            console.error('Delete rule error:', error);
        }
    };

    updateRulesList();
    dashboardInterval = setInterval(updateRulesList, 5000);
}

// Traffic Monitoring
function fetchTrafficMonitoring() {
    const content = document.getElementById("content");
    content.innerHTML = `
        <div class="security animate__animated animate__fadeIn">
            <h3>Traffic Monitoring</h3>
            <div class="row">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">Traffic Statistics</div>
                        <div class="card-body" id="traffic-stats"></div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">Traffic Trend</div>
                        <div class="card-body">
                            <div class="chart-container">
                                <canvas id="traffic-trend-chart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">Top Traffic Devices</div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-dark table-striped">
                                    <thead>
                                        <tr>
                                            <th>IP</th>
                                            <th>Port</th>
                                            <th>Total Traffic (Kbps)</th>
                                            <th>Protocol</th>
                                            <th>Last Seen</th>
                                        </tr>
                                    </thead>
                                    <tbody id="top-traffic-table"></tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    let trafficTrendChart = null;

    async function updateTrafficMonitoring() {
        try {
            // Traffic Stats
            const networkResponse = await fetch('http://localhost:3000/network');
            if (!networkResponse.ok) throw new Error('Network fetch failed');
            const network = await networkResponse.json();
            document.getElementById("traffic-stats").innerHTML = `
                <p><i class="fas fa-download"></i> Incoming: ${network.incoming} Kbps</p>
                <p><i class="fas fa-upload"></i> Outgoing: ${network.outgoing} Kbps</p>
                <p><i class="fas fa-exchange-alt"></i> Total: ${(parseFloat(network.incoming) + parseFloat(network.outgoing)).toFixed(2)} Kbps</p>
            `;

            // Traffic Trend Chart
            if (!trafficTrendChart) {
                const ctx = document.getElementById("traffic-trend-chart").getContext("2d");
                trafficTrendChart = new Chart(ctx, {
                    type: "line",
                    data: {
                        labels: [],
                        datasets: [
                            { label: "Incoming (Kbps)", data: [], borderColor: "#0dcaf0", fill: false },
                            { label: "Outgoing (Kbps)", data: [], borderColor: "#ffffff", fill: false }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: { title: { display: true, text: "Time" } },
                            y: { title: { display: true, text: "Traffic (Kbps)" }, beginAtZero: true }
                        }
                    }
                });
            }

            const timeLabel = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
            trafficTrendChart.data.labels.push(timeLabel);
            trafficTrendChart.data.datasets[0].data.push(parseFloat(network.incoming));
            trafficTrendChart.data.datasets[1].data.push(parseFloat(network.outgoing));
            if (trafficTrendChart.data.labels.length > 20) {
                trafficTrendChart.data.labels.shift();
                trafficTrendChart.data.datasets[0].data.shift();
                trafficTrendChart.data.datasets[1].data.shift();
            }
            trafficTrendChart.update();

            // Top Traffic Devices
            const devicesResponse = await fetch('http://localhost:3000/devices');
            if (!devicesResponse.ok) throw new Error('Devices fetch failed');
            const devices = await devicesResponse.json();
            const sortedDevices = devices.sort((a, b) => 
                (parseFloat(b.bytesIn) + parseFloat(b.bytesOut)) - (parseFloat(a.bytesIn) + parseFloat(a.bytesOut))
            ).slice(0, 5);
            document.getElementById("top-traffic-table").innerHTML = sortedDevices.map(device => `
                <tr>
                    <td>${device.ip}</td>
                    <td>${device.port}</td>
                    <td>${(parseFloat(device.bytesIn) + parseFloat(device.bytesOut)).toFixed(2)}</td>
                    <td>${device.protocol}</td>
                    <td>${device.lastSeen}</td>
                </tr>
            `).join('');
        } catch (error) {
            content.innerHTML = `<div class="alert alert-danger">Error loading traffic monitoring: ${error.message}</div>`;
        }
    }

    updateTrafficMonitoring();
    securityInterval = setInterval(updateTrafficMonitoring, 3000);
}

// Attack Detection
function fetchAttackDetection() {
    const content = document.getElementById("content");
    content.innerHTML = `
        <div class="security animate__animated animate__fadeIn">
            <h3>Attack Detection</h3>
            <div class="card">
                <div class="card-header">Detected Attacks</div>
                <div class="card-body">
                    <div id="attack-log" class="mt-3">
                        <h6>Attack Log</h6>
                        <ul class="list-group"></ul>
                    </div>
                </div>
            </div>
        </div>
    `;

    async function updateAttackLog() {
        const attackLog = document.querySelector("#attack-log .list-group");
        try {
            const response = await fetch('http://localhost:3000/attacks');
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const attacks = await response.json();
            attackLog.innerHTML = attacks.length === 0 ? 
                `<li class="list-group-item text-muted">No attacks detected yet.</li>` :
                attacks.map(attack => `
                    <li class="list-group-item text-danger">
                        <strong>${attack.timestamp}</strong>: ${attack.message}<br>
                        <span class="text-success">Mitigation: ${attack.mitigation}</span>
                    </li>
                `).join('');
        } catch (error) {
            attackLog.innerHTML = `<li class="list-group-item text-danger">Failed to load attacks: ${error.message}</li>`;
        }
    }

    updateAttackLog();
    securityInterval = setInterval(updateAttackLog, 3000);
}

// Toast Notification Function
let seenAlerts = new Set();
function showToast(alert) {
    const alertId = `${alert.timestamp}-${alert.message}`;
    if (seenAlerts.has(alertId)) return;
    seenAlerts.add(alertId);

    const toastContainer = document.querySelector(".toast-container");
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");
    toast.setAttribute("aria-atomic", "true");
    toast.innerHTML = `
        <div class="toast-header">
            <strong class="me-auto">Alert</strong>
            <small>${alert.timestamp}</small>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            ${alert.message}<br>
            <strong>Mitigation:</strong> ${alert.mitigation}
        </div>
    `;
    toastContainer.appendChild(toast);

    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();

    toast.addEventListener('hidden.bs.toast', () => toast.remove());
}

// Poll Alerts Globally
async function pollAlerts() {
    try {
        const response = await fetch('http://localhost:3000/alerts');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const alerts = await response.json();
        alerts.slice(0, 5).forEach(alert => showToast(alert));
    } catch (error) {
        console.error('Error polling alerts:', error);
    }
}
setInterval(pollAlerts, 3000);

// Helper Functions
async function fetchRules() {
    const rulesList = document.querySelector("#rulesList .list-group");
    try {
        const response = await fetch('http://localhost:3000/rules');
        const rules = await response.json();
        rulesList.innerHTML = rules.map(rule => `
            <li class="list-group-item">${rule.name}: ${rule.condition}</li>
        `).join('');
    } catch (error) {
        rulesList.innerHTML = `<li class="list-group-item text-danger">Failed to load rules</li>`;
    }
}

async function fetchIntrusions() {
    const intrusionLog = document.querySelector("#intrusionLog .list-group");
    try {
        const response = await fetch('http://localhost:3000/intrusions');
        const intrusions = await response.json();
        intrusionLog.innerHTML = intrusions.map(intrusion => `
            <li class="list-group-item text-warning">${intrusion.timestamp}: ${intrusion.message}</li>
        `).join('');
    } catch (error) {
        intrusionLog.innerHTML = `<li class="list-group-item text-danger">Failed to load intrusions</li>`;
    }
    setTimeout(fetchIntrusions, 5000);
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
    return color;
}

// Theme Toggle
document.getElementById("theme-toggle").addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    const icon = document.querySelector("#theme-toggle i");
    icon.classList.toggle("fa-moon");
    icon.classList.toggle("fa-sun");
});

// Navbar Scroll Effect
window.addEventListener("scroll", () => {
    document.querySelector(".navbar").classList.toggle("scrolled", window.scrollY > 50);
});

// Back to Top Button
const backToTop = document.getElementById("back-to-top");
window.addEventListener("scroll", () => {
    backToTop.style.display = window.scrollY > 300 ? "block" : "none";
});
backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// Intersection Observer
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("animate__animated", "animate__fadeInUp");
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });

document.querySelectorAll(".feature-card, #about, footer").forEach(el => observer.observe(el));