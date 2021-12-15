import Ws from "App/Services/Ws";
Ws.boot();

/**
 * Listen for incoming socket connections
 */
Ws.io.on("connection", (socket) => {
  console.log(`New connection with socket id ${socket.id}`);
});
