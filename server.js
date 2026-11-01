const { WebSocketServer, WebSocket } = require('ws');

// Railway fournit un port dynamique via process.env.PORT, sinon on utilise le port 8080 en local
const PORT = process.env.PORT || 8080;
const wss = new WebSocketServer({ port: PORT });

console.log(`Serveur WebSocket démarré et en écoute sur le port ${PORT}`);

wss.on('connection', (ws) => {
    console.log("Nouvelle connexion établie.");

    ws.on('message', (message) => {
        try {
            // Convertit le message reçu en texte (au cas où il arrive en buffer)
            const messageStr = message.toString();
            const data = JSON.parse(messageStr);
            
            // Si le message est un log envoyé par un bot, on le redistribue à tous les clients connectés (l'UI)
            if (data.type === "NEW_LOG") {
                console.log(`[LOG REÇU] ${data.payload.Name} (${data.payload.Income})`);
                
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
            console.error("Erreur de traitement du message:", err);
        }
    });

    ws.on('close', () => {
        console.log("Client déconnecté.");
    });

    ws.on('error', (err) => {
        console.error("Erreur WebSocket:", err);
    });
});