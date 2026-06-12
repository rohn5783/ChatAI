
import app from "./src/app.js";
import http from "http";
import { initServer } from "./sockets/server.socket.js";


const httpServer = http.createServer(app);
initServer(httpServer);

httpServer.listen(3000, () => {
    console.log("Server is running on port 3000");
});



