const http = require("http"); // http headers are added to transport metadata from A to B
const routes = require("./04-server-routes");

// Creates a server
const server = http.createServer(routes);

// Keep it running to listen for incoming requests
server.listen(3000); // Runs on port 3000 on localhost by default
