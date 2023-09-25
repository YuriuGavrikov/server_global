import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors from "cors";

const PORT = 3030;

export function WebSocketFu() {
	const app = express();

	app.use(
		cors({
			origin: "*",
			methods: ["GET", "POST"],
		})
	);

	const server = createServer(app);

	app.get("/", (req, res) => {
		res.send("Hello world");
	});

	const io = new Server(server, {
		cors: {
			origin: "*",
			methods: ["GET", "POST"],
		},
	});

	io.on("connection", (socket) => {
		console.log("connection");
		socket.on("message", (msg) => {
			console.log("message");
			io.emit("message", msg);
		});
		socket.on("disconnect", (reason) => {
			console.log("disconnect", reason);
		});
	});

	server.listen(PORT, (error) => {
		error ? console.log(error) : console.log(`listening port ${PORT}`);
	});
}
