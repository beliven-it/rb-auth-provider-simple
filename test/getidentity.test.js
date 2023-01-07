import * as t from "tap";
import createAuthProvider from "../src/index.js";

t.test("getIdentity", async (t) => {
  t.test("without passing a user", async (t) => {
    const provider = createAuthProvider("https://my.api.url/auth");
    const res = await provider.getIdentity();
    t.equal(res, "", "should return an empty string");
  });
});
