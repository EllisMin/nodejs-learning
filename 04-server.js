const http = require("http"); // http headers are added to transport metadata from A to B
const fs = require("fs");

// Creates a server
const server = http.createServer((req, res) => {
  // Request Object; viewable in network tab
  // console.log(req);
  // console.log(req.url, req.method, req.headers);

  // Creating route
  const url = req.url;
  const method = req.method;
  // Home route
  if (url === "/") {
    // Content-type: efault header, attach header to the response. type will be html
    res.setHeader("Content-Type", "text/html");
    // write data to response(sending back data); also viewable in network tab
    res.write("<html>");
    res.write("<head><title>My Page</title></head>");
    res.write(
      "<body><form action='/message' method='POST'><input type='text' name='message'><button type='submit'>Send</button></form></body>"
    );
    res.write("</html>");
    return res.end(); // can't write anymore after end()
  }
  // Message route
  if (url === "/message" && method === "POST") {
    const body = [];

    // Working wih request chunk of data
    req.on("data", chunk => {
      console.log(chunk);
      body.push(chunk);
    });

    // Listener fired after done parsing request above that needs parsing
    return req.on("end", () => {
      const parseBody = Buffer.concat(body).toString();
      //   console.log(parseBody);
      const message = parseBody.split("=")[1];

      // Create new file (filename, data)
      fs.writeFile("message.txt", message, err => {
        // redirect user to homepage
        // Method 1: redirection
        res.writeHead(302, {
          Location: "/"
        });
        // Method 2: redirection
        // res.statusCode = 302; // 302: code for redirection
        // res.setHeader('Location', "/");
        return res.end();
      });
    });
  }

  // Content-type: efault header, attach header to the response. type will be html
  res.setHeader("Content-Type", "text/html");
  // write data to response(sending back data); also viewable in network tab
  res.write("<html>");
  res.write("<head><title>My Page</title></head>");
  res.write("<body><h1>HELLO12</h1></body>");
  res.write("</html>");
  res.end(); // can't write anymore after end()

  // process.exit(); /// stops server
});

// Keep it running to listen for incoming requests
server.listen(3000); // Runs on port 3000 on localhost by default
