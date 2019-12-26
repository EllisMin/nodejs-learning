const http = require("http");
const handler = require("./05-challenge-routes");

const server = http.createServer(handler);

server.listen(3000);