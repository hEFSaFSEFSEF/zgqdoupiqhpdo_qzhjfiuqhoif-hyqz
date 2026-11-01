const { createServer } = require('http');
const { WebSocketServer, WebSocket } = require('ws');

// Crée un serveur HTTP de base (nécessaire pour Render)
const server = createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Serveur WebSocket Actif\n');
});

// Attache le WebSocket sur ce serveur HTTP
const wss = new WebSocketServer({ server });

console.log("Serveur WebSocket démarré");

wss.on('connection', (ws) => {
    console.log("Nouvelle connexion établie.");

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString());
            if (data.type === "NEW_LOG") {
                const broadcastData = JSON.stringify({
                    type: "ADD_LOG",
                    payload: data.payload
                });

                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(broadcastData);
                    }
                });
            }
        } catch (err) {
            console.error("Erreur:", err);
        }
    });
});

// Utilise le port attribué par Render
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
});
