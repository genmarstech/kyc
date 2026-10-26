
import { createHash, randomBytes } from "node:crypto";
import QRCode from "qrcode";
import type { FastifyInstance } from "fastify";
import { createQrSessionRepository } from "./sessions.repository.js";

const SESSION_TTL_MS = 5 * 60 * 1000;

function createToken(): string {
  return randomBytes(32).toString("base64url");
}



function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function getPublicAppUrl(): string {
  const value = process.env.PUBLIC_APP_URL;

  if (!value) {
    throw new Error("PUBLIC_APP_URL is not configured");
  }

  const url = new URL(value);

  if (
    process.env.NODE_ENV === "production" &&
    url.protocol !== "https:"
  ) {
    throw new Error("PUBLIC_APP_URL must use HTTPS in production");
  }

  return url.toString().replace(/\/$/, "");
}

export function createQrSessionService(fastify: FastifyInstance) {
  const repository = createQrSessionRepository(fastify);

  return {
    async create() {
      const claimToken = createToken();
      const pollToken = createToken();
      const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

      const session = await repository.create(
        hashToken(claimToken),
        hashToken(pollToken),
        expiresAt,
      );

      if (!session) {
  throw new Error("Failed to create QR session");
}

      const claimUrl =
        `${getPublicAppUrl()}/qr/claim#token=${claimToken}`;

      // Generate SVG for the API response.
      const qrSvg = await QRCode.toString(claimUrl, {
        type: "svg",
        errorCorrectionLevel: "M",
        margin: 4, // quiet zone of 4 is the spec; 2 can fail on some scanners
        width: 300,
      });

      const qrPng = await QRCode.toBuffer(claimUrl, {
        type: "png",
        errorCorrectionLevel: "M",
        margin: 4,
        width: 400,
      });

      const qrTerminal = await QRCode.toString(claimUrl, {
        type: "terminal",
        small: true,
      });

      return {
        success: true as const,
        sessionId: session.id,
        pollToken,
        qrSvg,
        qrPng,
        qrTerminal,
        expiresAt: session.expires_at,
      };
    },

    async claim(token: string) {
      return repository.claim(hashToken(token));
    },

    async getStatus(sessionId: string, pollToken: string) {
      return repository.getStatus(
        sessionId,
        hashToken(pollToken),
      );
    },
  };
}
