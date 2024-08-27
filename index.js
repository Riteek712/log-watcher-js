const fs = require('fs');
const WebSocket = require('ws');
const path = require('path');
const http = require('http');
const express = require('express');

const LOG_PATH_FILE = path.join(__dirname, 'logfile.log'); // Path to your log file.
const HTTP_PORT = 3000;

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = [];
let lastSize = 0;

// Function to get the last N lines of a file
function getLastNLines(filepath, n, callback) {
    const stream = fs.createReadStream(filepath, {
        encoding: 'utf8',
        highWaterMark: 1024 * 64 // Read in chunks of 64KB
    });

    let data = '';
    let lines = [];
    
    stream.on('data', chunk => {
        data = chunk + data;
        lines = data.split('\n');
        if (lines.length > n + 1) {
            stream.destroy(); // Stop reading once we have enough lines
            callback(null, lines.slice(-n).join('\n'));
        }
    });

    stream.on('end', () => {
        if (lines.length <= n) {
            callback(null, lines.join('\n'));
        }
    });

    stream.on('error', err => {
        callback(err, null);
    });
}

// Serve the HTML file
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.send("Go to /log endpoint");
});

app.get('/log', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// WebSocket server setup
fs.watchFile(LOG_PATH_FILE, (curr, prev) => {
    if (curr.size > lastSize) {
        const stream = fs.createReadStream(LOG_PATH_FILE, {
            start: lastSize,
            end: curr.size,
            encoding: 'utf8'
        });

        let data = '';
        stream.on('data', chunk => data += chunk);
        stream.on('end', () => {
            clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(data);
                }
            });
        });

        lastSize = curr.size;
    }
});

wss.on('connection', (ws) => {
    clients.push(ws);

    // Send the last 10 lines to the new client
    getLastNLines(LOG_PATH_FILE, 10, (err, lastLines) => {
        if (err) {
            console.error('Error reading last lines:', err);
        } else {
            ws.send(lastLines);
        }
    });

    ws.on('close', () => {
        clients = clients.filter(client => client !== ws);
    });
});

server.listen(HTTP_PORT, () => {
    console.log(`HTTP server is running on http://localhost:${HTTP_PORT}`);
});
