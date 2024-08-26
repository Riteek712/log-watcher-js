const fs = require('fs')
const WebSocket = require('ws');
const path = require('path')
const http = require('http')
const express = require('express')

const LOG_PATH_FILE = path.join(__dirname, 'logfile.log'); // Path to your log file.
const PORT = 8080;
const HTTP_PORT = 3000;

const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({server})

let clients = [];
let lastSize = 0;

// Serve the HTML file
app.use(express.static(path.join(__dirname, 'public')))
app.get('/log', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});
// Websocket server
fs.watchFile(LOG_PATH_FILE,(curr, prev)=>{
    console.log("in watch function")
    if(curr.size > lastSize){
        const stream = fs.createReadStream(LOG_PATH_FILE, {
                start: lastSize,
                end: curr.size,
                encoding: 'utf-8'
        });

        let data = '';
        stream.on('data', chunk => data += chunk);
        stream.on('end', ()=>{
            clients.forEach(client =>{
                if (client.readyState === WebSocket.OPEN){
                    client.send(data);
                }
            })
        })
        lastSize = curr.size;
    }
})
wss.on('connection', (ws)=>{
    clients.push(ws)

    fs.readFile(LOG_PATH_FILE, 'utf-8', (err, data)=>{
        if(err) throw err;
        const lines = data.trim().split('\n');
        const last10lines = lines.splice(-10).join('\n')

        ws.send(last10lines)
    })

    ws.on('close', ()=>{
        clients = clients.filter(client => client !== ws)
    })
})



server.listen(HTTP_PORT, ()=>{
    console.log(`HTTP server is runnning on http://localhost:${HTTP_PORT}`)
})
