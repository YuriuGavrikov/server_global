import WebSocket, { WebSocketServer } from "ws";

export function WebSocketFu() {
	const wss = new WebSocketServer(
		{
			port: 6000,
			perMessageDeflate: {
				zlibDeflateOptions: {
					// See zlib defaults.
					chunkSize: 1024,
					memLevel: 7,
					level: 3,
				},
				zlibInflateOptions: {
					chunkSize: 10 * 1024,
				},
				// Other options settable:
				clientNoContextTakeover: true, // Defaults to negotiated value.
				serverNoContextTakeover: true, // Defaults to negotiated value.
				serverMaxWindowBits: 10, // Defaults to negotiated value.
				// Below options specified as default values.
				concurrencyLimit: 10, // Limits zlib concurrency for perf.
				threshold: 1024, // Size (in bytes) below which messages
				// should not be compressed if context takeover is disabled.
			},
		},
		() => console.log(`Server started on 6000`)
	);

	wss.on("connection", function connection(WebSocket) {
		WebSocket.on("message", function (message) {
			message = JSON.parse(message);
			switch (message.event) {
				case "message":
					broadcastMessage(message);
					break;
				case "connection":
					broadcastMessage(message);
					break;
			}
		});
	});

	function broadcastMessage(message, id) {
		wss.clients.forEach((client) => {
			client.send(JSON.stringify(message));
		});
	}
}
