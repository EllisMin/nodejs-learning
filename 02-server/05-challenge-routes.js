const fs = require("fs");

const requestHandler = (req, res) => {
  const url = req.url;
  const method = req.method;
  //   console.log(url); ///

  // Home route
  if (url === "/") {
    res.setHeader("Content-Type", "text/html");
    res.write("<html>");
    res.write("<head><title>HOME</title></head>");
    res.write("<body><h1>Hello!</h1>");
    res.write("<form action='/create-user' method='POST'>");
    res.write(
      "<input type='text' name='name' placeholder='type your name'><button type='submit'>Send</button>"
    );
    res.write("</form></body>");
    res.write("</html>");
    return res.end();
  }
  // Users route
  if (url === "/users") {
    res.setHeader("Content-Type", "text/html");
    res.write("<html>");
    res.write("<head><title>USERS</title></head>");
    res.write("<body>");
    res.write("<div><ul><li>User1</li><li>User2</li></ul></div>");
    res.write("</body>");
    res.write("</html>");
    return res.end();
  }
  if (url === "/create-user" && method === "POST") {
    const body = [];
    req.on("data", chunk => {
      body.push(chunk);
    });
    return req.on("end", () => {
      const parseBody = Buffer.concat(body).toString();
      const message = parseBody.split("=")[0];
      console.log(message);
      res.statusCode = 302;
      res.setHeader("Location", "/");
      return res.end();
    });
  }
};

// Export
module.exports = requestHandler;
// exports = requestHandler;
