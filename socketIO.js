import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors from "cors";

export function WebSocketFu() {
	const router = express.Router();
	router.get("/", (req, res) => {
		res.setHeader("Access-Control-Allow-Origin", "*");

		res.setHeader(
			"Access-Control-Allow-Methods",
			"GET, POST, OPTIONS, PUT, PATCH, DELETE"
		);

		res.setHeader(
			"Access-Control-Allow-Headers",
			"X-Requested-With,content-type"
		);

		res.send("Это только мой мир.");
	});

	const app = express();
	app.use(cors({ origin: "*" }));
	app.use(router);

	const server = createServer(app);

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
	});

	server.listen(3040, () => {
		console.log("server running at port 3040");
	});
}
