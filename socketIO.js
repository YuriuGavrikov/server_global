import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

export function WebSocketFu() {
	const app = express();
	const server = createServer(app);
	const io = new Server(server, {
		cors: {
			origin: "http://localhost:5173/Chat-vue-socketio/",
			// origin: "http://yuriugavrikov.github.io/Chat-vue-socketio/",
		},
	});

	io.on("connection", (socket) => {
		socket.on("message", (msg) => {
			io.emit("message", msg);
		});
	});

	server.listen(5060, () => {
		console.log("server running at port 3030");
	});
}
