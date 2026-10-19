import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { createQrSessionService } from "./sessions.service.js";

type QrFormat = "json" | "png" | "svg" | "terminal";

const TOKEN_RE = /^[A-Za-z0-9_-]{40,50}$/;
const UUID_RE = /^[0-9a-f-]{36}$/i;

export function createQrSessionHandlers(fastify: FastifyInstance) {
  const service = createQrSessionService(fastify);

  return {
    create: async (
      request: FastifyRequest<{ Querystring: { format?: QrFormat } }>,
      reply: FastifyReply,
    ) => {
      const { qrPng, qrTerminal, ...session } = await service.create();
      const format = request.query.format ?? "json";

      reply
        .code(201)
        .header("Cache-Control", "no-store")
        .header("X-Session-Id", session.sessionId)
        .header("X-Poll-Token", session.pollToken);

      switch (format) {
        case "png":
          return reply.type("image/png").send(qrPng);
        case "svg":
          return reply.type("image/svg+xml").send(session.qrSvg);
        case "terminal":
          return reply.type("text/plain; charset=utf-8").send(qrTerminal);
        default:
          return reply.send(session);
      }
    },

    claim: async (
      request: FastifyRequest<{ Body: { token: string } }>,
      reply: FastifyReply,
    ) => {
      const token = request.body?.token;

      if (typeof token !== "string" || !TOKEN_RE.test(token)) {
        return reply.code(400).send({
          success: false,
          message: "A valid QR token is required",
        });
      }

      try {
        const result = await service.claim(token);

        if (!result) {
          return reply.code(401).send({
            success: false,
            message: "Invalid QR token",
          });
        }

        return reply.send({
          success: true,
          sessionId: result.sessionId,
          database: {
            status: "connected",
            pingMs: result.pingMs,
          },
        });
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === "QrSessionExpiredError") {
            return reply.code(410).send({
              success: false,
              message: "QR session expired",
            });
          }

          if (error.name === "QrSessionAlreadyUsedError") {
            return reply.code(409).send({
              success: false,
              message: "QR session has already been claimed",
            });
          }
        }

        throw error;
      }
    },

    status: async (
      request: FastifyRequest<{
        Params: { sessionId: string };
        Headers: { "x-session-poll-token"?: string };
      }>,
      reply: FastifyReply,
    ) => {
      const { sessionId } = request.params;
      const pollToken = request.headers["x-session-poll-token"];

      if (
        typeof sessionId !== "string" ||
        !UUID_RE.test(sessionId) ||
        typeof pollToken !== "string" ||
        !TOKEN_RE.test(pollToken)
      ) {
        return reply.code(400).send({
          success: false,
          message: "Invalid session credentials",
        });
      }

      const session = await service.getStatus(sessionId, pollToken);

      if (!session) {
        return reply.code(404).send({
          success: false,
          message: "Session not found",
        });
      }

      return reply.send({
        success: true,
        sessionId: session.id,
        status: session.status,
        expiresAt: session.expires_at,
      });
    },
  };
}