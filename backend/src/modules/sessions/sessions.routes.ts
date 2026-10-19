import type { FastifyPluginAsync } from "fastify";
import { createQrSessionHandlers } from "./sessions.handlers.js";

const sessionsRoutes: FastifyPluginAsync = async (fastify) => {
  const handlers = createQrSessionHandlers(fastify);

  fastify.post<{
    Querystring: { format?: "json" | "png" | "svg" | "terminal" };
  }>("/qr", {
    schema: {
      querystring: {
        type: "object",
        additionalProperties: false,
        properties: {
          format: {
            type: "string",
            enum: ["json", "png", "svg", "terminal"],
            default: "json",
          },
        },
      },
    },
  }, handlers.create);

  fastify.post<{
    Body: { token: string };
  }>("/claim", {
    schema: {
      body: {
        type: "object",
        required: ["token"],
        additionalProperties: false,
        properties: {
          token: { type: "string", minLength: 40, maxLength: 50 },
        },
      },
    },
  }, handlers.claim);

  fastify.get<{
    Params: { sessionId: string };
    Headers: { "x-session-poll-token"?: string };
  }>("/qr/:sessionId/status", handlers.status);
};

export default sessionsRoutes;