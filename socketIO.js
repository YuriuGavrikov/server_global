import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

export function WebSocketFu() {
	const app = express();
	const server = createServer(app);
	const io = new Server(server, {
		cors: {
			origin: "http://localhost:5173",
		},
	});

	io.on("connection", (socket) => {
		console.log("connect");
		socket.on("message", (msg) => {
			console.log("message");
			io.emit("message", msg);
		});
	});

	server.listen(3000, () => {
		console.log("server running at http://localhost:3000");
	});
}
