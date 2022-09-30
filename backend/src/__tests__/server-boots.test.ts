import { HELLO_RESPONSE } from "../constants";
import supertest from "supertest";
import HelloController from "../server/controllers/hello";
import { server } from "..";
import expressApp from "../server";
import SearchController from "../server/controllers/search";
import { AppDataSource } from "../data-source";

export const testServer = supertest.agent(expressApp);

describe("Server", () => {
  beforeAll(async () => {
    await AppDataSource.driver.connect();
  });
  it("Homepage controller constructs", () => {
    expect(() => new HelloController()).not.toThrow();
  });
  it("Search controller constructs", () => {
    expect(() => new SearchController()).not.toThrow();
  });

  it("Serves homepage", async () => {
    const response = await testServer.get("/v3/hello");
    expect(response.status).toBe(200);
    expect(response.text).toEqual(JSON.stringify(HELLO_RESPONSE));
  });

  const getNotes = async () => {
    return await loginToServer(
      "tester@shair.co",
      "secure-password-for-assessment"
    ).then(async ({ body }) => {
      const res = await testServer
        .get("/v3/profile")
        .set("Cookie", "token=" + body.token);
      expect(res.body.length).not.toEqual(0);
      expect(res.body.user.token).toBe(body.token);
      return res.body;
    });
  };

  const loginToServer = async (email: string, password: string | number) => {
    return await testServer.post("/v3/login").send({
      email,
      password,
    });
  };

  it("Get notes from profile", async () => {
    await getNotes();
  });

  it("Get particular note", async () => {
    await getNotes().then(async (response) => {
      const { token } = await response.user;
      const { id, text } = await response.notes[0];
      const res = await testServer
        .get("/v3/note/" + id)
        .set("Cookie", "token=" + token);
      expect(res.body.id).toEqual(id);
      expect(res.body.text).toEqual(text);
    });
  });

  it("Login with correct creds", async () => {
    const response = await loginToServer(
      "tester@shair.co",
      "secure-password-for-assessment"
    );
    expect(response.statusCode).toBe(200);
    expect(response.body.authenticated).toBe(true);
    expect(response.body.token.length).toBeGreaterThan(0);
  });

  it("Login with incorrect creds", async () => {
    const response = await loginToServer(
      "test@shair.co",
      "secure-password-for-assessment"
    );
    expect(response.statusCode).toBe(400);
    expect(response.body.authenticated).toBe(false);
    expect(response.body.message).toBe("Incorrect email or password");
  });

  it("Create new note and find within /note response", async () => {
    const { user, notes } = await getNotes();
    const newNote = {
      text: "Note from supertest",
      userId: user.id,
    };
    const response = await testServer
      .post("/v3/note")
      .set("Cookie", "token=" + user.token)
      .send(newNote);
    expect(response.body.user.id).toBe(user.id);
    expect(response.body.text).toBe(newNote.text);

    const res = await getNotes();
    const newNoteIsExist = res.notes.some(
      (note: { text: string }) => note.text === newNote.text
    );
    expect(res.notes.length).toBe(notes.length + 1);
    expect(newNoteIsExist).toBe(true);
  });

  it("Search by text", async () => {
    const res = await testServer.post("/v3/search").send({
      text: "Sample note for the hiring assignment",
      size: 10,
      owner: "",
    });
    expect(res.body.length).not.toBe(0);
  });
});

afterAll(async () => {
  (await server).close();
  await AppDataSource.driver.disconnect();
});
