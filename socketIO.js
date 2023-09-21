import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

export function WebSocketFu() {
	const app = express();
	const server = createServer(app);
	const io = new Server(server, {
		cors: {
			// origin: "http://localhost:5173",
			origin: "*",
		},
	});

	io.on("connection", (socket) => {
		console.log("connection");
		socket.on("message", (msg) => {
			console.log("message");
			io.emit("message", msg);
		});
	});

	server.listen(3040, () => {
		console.log("server running at port 3040");
	});
}
