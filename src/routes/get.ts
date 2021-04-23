import { Request, ResponseToolkit, ServerRoute } from "@hapi/hapi";
import { StatusCodes } from "http-status-codes";
import { string } from "joi";
import fetch from "node-fetch";

export const routes = (): ServerRoute => ({
  method: "GET",
  path: "/",
  options: {
    handler: async (request: Request, h: ResponseToolkit) => {
      const { identifier } = request.query;

      const response = await fetch(
        "https://appstore.elgato.com/streamDeckPlugin/catalog.json"
      );
      const { plugins } = await response.json();

      const plugin = plugins.find(
        (plugin: Record<string, string>) => plugin.identifier === identifier
      );

      if (!plugin) {
        return h.response().code(StatusCodes.NOT_FOUND);
      }

      return h
        .response({
          color: "orange",
          label: "StreamDeck AppStore",
          message: `${plugin.downloads}`,
          schemaVersion: 1,
        })
        .code(StatusCodes.OK);
    },
    validate: {
      query: {
        identifier: string().required(),
      },
    },
  },
});
