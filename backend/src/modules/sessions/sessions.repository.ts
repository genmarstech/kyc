
import type { FastifyInstance } from "fastify";
import type { PoolClient } from "pg";
import type { QrSessionStatus } from "./sessions.types.js";

export interface QrSessionRecord {
  id: string;
  status: QrSessionStatus;
  expires_at: Date;
}

export function createQrSessionRepository(fastify: FastifyInstance) {
  return {
    async create(
      claimTokenHash: string,
      pollTokenHash: string,
      expiresAt: Date,
    ) {
      const result = await fastify.pg.query<{
        id: string;
        expires_at: Date;
      }>(
        `INSERT INTO qr_sessions (
           claim_token_hash,
           poll_token_hash,
           expires_at
         )
         VALUES ($1, $2, $3)
         RETURNING id, expires_at`,
        [claimTokenHash, pollTokenHash, expiresAt],
      );

      return result.rows[0];
    },

    async claim(
      claimTokenHash: string,
    ): Promise<{
      sessionId: string;
      pingMs: number;
    } | null> {
      const client: PoolClient = await fastify.pg.connect();

      try {
        await client.query("BEGIN");

        const result = await client.query<QrSessionRecord>(
          `SELECT id, status, expires_at
           FROM qr_sessions
           WHERE claim_token_hash = $1
           FOR UPDATE`,
          [claimTokenHash],
        );

        const session = result.rows[0];

        if (!session) {
          await client.query("ROLLBACK");
          return null;
        }

        if (session.status !== "pending") {
          await client.query("ROLLBACK");

          const error = new Error("QR session already used");
          error.name = "QrSessionAlreadyUsedError";
          throw error;
        }

        if (new Date(session.expires_at).getTime() <= Date.now()) {
          await client.query(
            `UPDATE qr_sessions
             SET status = 'expired'
             WHERE id = $1`,
            [session.id],
          );

          await client.query("COMMIT");

          const error = new Error("QR session expired");
          error.name = "QrSessionExpiredError";
          throw error;
        }

        const startedAt = process.hrtime.bigint();
        await client.query("SELECT 1");

        const pingMs =
          Number(process.hrtime.bigint() - startedAt) / 1_000_000;

        await client.query(
          `UPDATE qr_sessions
           SET status = 'claimed',
               claimed_at = NOW()
           WHERE id = $1`,
          [session.id],
        );

        await client.query("COMMIT");

        return {
          sessionId: session.id,
          pingMs: Math.round(pingMs * 100) / 100,
        };
      } catch (error) {
        await client.query("ROLLBACK").catch(() => undefined);
        throw error;
      } finally {
        client.release();
      }
    },

    async getStatus(sessionId: string, pollTokenHash: string) {
      const result = await fastify.pg.query<{
        id: string;
        status: QrSessionStatus;
        expires_at: Date;
      }>(
        `UPDATE qr_sessions
         SET status = CASE
           WHEN status = 'pending' AND expires_at <= NOW()
             THEN 'expired'
           ELSE status
         END
         WHERE id = $1
           AND poll_token_hash = $2
         RETURNING id, status, expires_at`,
        [sessionId, pollTokenHash],
      );

      return result.rows[0] ?? null;
    },
  };
}
