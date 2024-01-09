import http from "http";

const user = {
  id: 1,
  email: "a@a.it",
};

const handler = function (req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.method === "POST") {
    const body = [];
    req.on("data", function (chunk) {
      body.push(chunk);
    });
    req.on("end", function () {
      const payload = JSON.parse(Buffer.concat(body).toString());
      if (payload && payload.email === user.email) {
        const response = JSON.stringify({
          user,
          token: "xyz",
        });
        res.statusCode = 200;
        res.write(response);
      }
      res.end();
    });
  } else {
    res.statusCode = 404;
    res.end();
  }
};

function createServer(test, port = 3100) {
  const server = http.createServer(handler);

  test.teardown(() => server.close());

  return server.listen(port);
}

export default createServer;
