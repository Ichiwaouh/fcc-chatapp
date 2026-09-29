import http from 'http';
import fs from 'fs';
import { WebSocketServer } from 'ws';

const PORT = 3001;

const server = http.createServer((req, res) => {
    const data = fs.readFileSync("./public/index.html", { encoding: "utf-8" })
    res.writeHead(200, { "content-type": "text/html" })
    res.end(data)
})

const wss = new WebSocketServer({ server })

const broadcast = data => {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN)
            client.send(JSON.stringify(data));
    });
}

wss.on("connection", (socket, req) => {
    const username = new URL(req.url, "http://localhost").searchParams.get("username")

    broadcast({ "type": "system", "text": username + " joined" })

    socket.on("message", (buffer) => {
        const data = JSON.parse(buffer.toString())
        broadcast({ "type": "chat", ...data })
    })

    socket.on("close", () => {
        broadcast({ "type": "system", "text": username + " left" })
    })
})

const alert = () => { console.log("Chat server running at http://localhost:3001") }
server.listen(PORT, alert)