
import session from "@fastify/session";
import cookie from "@fastify/cookie";
import type { FastifyPluginAsync } from "fastify";

const startSession: FastifyPluginAsync = async (fastify) => {
  await fastify.register(cookie);

  await fastify.register(session, {
    secret: process.env.SESSION_SECRET!,
    cookieName: "kyc.sid",
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 1000 * 60 * 60 * 24,
    },
  });
};

export default startSession;
