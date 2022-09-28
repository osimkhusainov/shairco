import { HELLO_RESPONSE } from "../constants";
import supertest from "supertest";
import HelloController from "../server/controllers/hello";
import { server } from "..";
import expressApp from "../server";
import SearchController from "../server/controllers/search";
import { AppDataSource } from "../data-source";

export const testServer = supertest.agent(expressApp);

describe("Server", () => {
  it("Homepage controller constructs", () => {
    expect(() => new HelloController()).not.toThrow();
  });
  it("Search controller constructs", () => {
    expect(() => new SearchController()).not.toThrow();
  });

  it("profile", async () => {
    const tok = await testServer.post("/v3/login").send({
      email: "test@shair.co",
      password: "secure-password-for-assessment",
    });

    console.log(tok);
    const response = await testServer
      .get("/v3/profile")
      .set("Cookie", [`token=${tok}`]);
    // console.log(response);
  });
  // it("Serves homepage", async () => {
  //   const response = await testServer.get("/v3/hello");
  //   expect(response.status).toBe(200);
  //   // expect(response.text).toEqual(JSON.stringify(HELLO_RESPONSE));
  // });

  // it("Serves homepage", async () => {
  //   const response = await testServer.get("/v3/profile");
  //   console.log(response);
  //   expect(response.status).toBe(200);
  //   // expect(response.text).toEqual(JSON.stringify(HELLO_RESPONSE));
  // });
  // it("Serves homepage", async () => {
  //   const response = await testServer
  //     .post("/v3/login")
  //     .send({
  //       email: "test@shair.co",
  //       password: "secure-password-for-assessment",
  //     });
  //   // console.log(response);
  //   expect(response.status).toBe(200);
  //   // expect(response.text).toEqual(JSON.stringify(HELLO_RESPONSE));
  // });
});

afterAll(async () => {
  (await server).close();
  await AppDataSource.driver.disconnect();
});
