import t from "tap";
import createAuthProvider from "../src/index.js";
import createServer from "./server.js";

const PORT = 3100;

t.test("login", async (t) => {
  createServer(t);

  t.test("without credentials", async (t) => {
    const provider = createAuthProvider(`http://localhost:${PORT}`);
    try {
      await provider.login({});
      t.fail("should throw an error");
    } catch (err) {
      t.ok(err, "should throw an error");
    }
  });

  t.test("with invalid credentials", async (t) => {
    const provider = createAuthProvider(`http://localhost:${PORT}`);
    try {
      await provider.login({
        email: "a@b.it",
      });
      t.fail("should throw an error");
    } catch (err) {
      t.ok(err, "should throw an error");
    }
  });

  t.test("with valid credentials", async (t) => {
    const provider = createAuthProvider(`http://localhost:${PORT}`, {
      storage: null,
    });
    try {
      const credentials = {
        email: "a@a.it",
      };
      const res = await provider.login(credentials);
      t.equal(
        res.data.email,
        credentials.email,
        "should return the authenticated user details"
      );
    } catch (err) {
      t.error(err, "should not throw any error");
    }
  });
});
