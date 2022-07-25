const { test, expect } = require("@playwright/test");

test("punch-test", async ({ request }) => {
  let res = await request.post("http://localhost:3000/api/punch", {
    data: JSON.stringify({ user: "test", time: Date.now(), mode: "in" }),
  });

  expect(res.status === 200);
});
