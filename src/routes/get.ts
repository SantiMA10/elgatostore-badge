import { Request, ResponseToolkit, ServerRoute } from "@hapi/hapi";
import { StatusCodes } from "http-status-codes";

export const routes = (): ServerRoute => ({
  method: "GET",
  path: "/",
  handler: async (_: Request, h: ResponseToolkit) => {
    return h.response({ ok: true }).code(StatusCodes.OK);
  },
});
