import { StatusCodes } from "http-status-codes";
import nock from "nock";

import { initServer } from "../../src/server";

describe("GET /", () => {
  it("returns a 400 Bad Request HTTP if the identifier is missing", async () => {
    const subject = await initServer();

    const { statusCode } = await subject.inject({
      method: "GET",
      url: "/",
    });

    expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
  });

  it("asks the elgato app store to get the number of downloads", async () => {
    const scope = nock("https://appstore.elgato.com")
      .get("/streamDeckPlugin/catalog.json")
      .reply(200, {
        store: "streamDeckPlugin",
        base_url: "https://appstore.elgato.com",
        plugins: [
          {
            identifier: "dev.santiagomartin.devops",
            downloads: 5972,
            catalog_version: 14,
          },
        ],
      });

    const subject = await initServer();

    await subject.inject({
      method: "GET",
      url: "/?identifier=dev.santiagomartin.devops",
    });

    expect(scope.isDone()).toBe(true);
  });

  it("returns a 404 Not Found HTTP if the identifier is not available in the app store", async () => {
    nock("https://appstore.elgato.com")
      .get("/streamDeckPlugin/catalog.json")
      .reply(200, {
        store: "streamDeckPlugin",
        base_url: "https://appstore.elgato.com",
        plugins: [
          {
            identifier: "dev.santiagomartin.devops",
            downloads: 5972,
            catalog_version: 14,
          },
        ],
      });

    const subject = await initServer();

    const { statusCode } = await subject.inject({
      method: "GET",
      url: "/?identifier=dev.santiagomartin.test",
    });

    expect(statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  it("returns a 500 Internal Server Error when the request to the AppStore fails", async () => {
    nock("https://appstore.elgato.com")
      .get("/streamDeckPlugin/catalog.json")
      .reply(500);

    const subject = await initServer();

    const { statusCode } = await subject.inject({
      method: "GET",
      url: "/?identifier=dev.santiagomartin.devops",
    });

    expect(statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  });

  it("returns the information to create the badge", async () => {
    nock("https://appstore.elgato.com")
      .get("/streamDeckPlugin/catalog.json")
      .reply(200, {
        store: "streamDeckPlugin",
        base_url: "https://appstore.elgato.com",
        plugins: [
          {
            identifier: "dev.santiagomartin.devops",
            downloads: 5972,
            catalog_version: 14,
          },
        ],
      });

    const subject = await initServer();

    const { result } = await subject.inject({
      method: "GET",
      url: "/?identifier=dev.santiagomartin.devops",
    });

    expect(result).toStrictEqual({
      schemaVersion: 1,
      label: "StreamDeck AppStore",
      message: "5972",
      color: "orange",
    });
  });
});
