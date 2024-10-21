import t from "tap";
import createAuthProvider from "../src/index.js";

const PORT = 3100;

t.test("parseError", async (t) => {
  t.test("without custom error parser", async (t) => {
    const provider = createAuthProvider(`http://localhost:${PORT}`, {
      client: () => {
        return Promise.resolve({
          ok: false,
          status: "403",
          async json() {
            return {
              errors: ["Forbidden"],
            };
          },
        });
      },
    });
    try {
      await provider.login({
        email: "a@a.it",
      });
      t.fail("should throw an error");
    } catch (err) {
      t.equal(
        err,
        "403",
        "should return the standard error message from the server"
      );
    }
  });

  t.test("with custom error parser", async (t) => {
    const provider = createAuthProvider(`http://localhost:${PORT}`, {
      parseError: async (res) => {
        const err = await res.json();
        return err?.errors[0];
      },
      client: () => {
        return Promise.resolve({
          ok: false,
          status: "403",
          async json() {
            return {
              errors: ["Forbidden"],
            };
          },
        });
      },
    });
    try {
      await provider.login({
        email: "a@a.it",
      });
      t.fail("should throw an error");
    } catch (err) {
      t.equal(
        err,
        "Forbidden",
        "should return the parsed error message from the server"
      );
    }
  });
});
