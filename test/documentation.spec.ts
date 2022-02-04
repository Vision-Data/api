import test from "japa";
import supertest from "supertest";

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`;

test.group("Documentation access", () => {
  test("should that return response successfuly", async (assert) => {
    await supertest(BASE_URL).get("/docs/index.html").expect(200);
  });
});
