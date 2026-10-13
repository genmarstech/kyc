import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

const InfoPlugin: FastifyPluginAsync = async (app) => {
    app.get('/sys-info', async () => {
        let db: "up" | "down" = "down"
        
        try {
            await app.pg.query("SELECT 1");
            db = "up"
        } catch (error) {
            app.log.error(error)
        }

        return {
            name: process.env.APPLICATION_NAME ?? 'BAsic api',
            version: process.env.APPLICATION_VERSION ?? 'unknown',
            env: process.env.NODE_MODE ?? "development",
            uptimeSeconds: Math.round(process.uptime()), db,
            time: new Date().toISOString(),

        }

    })
}

export default fp(InfoPlugin, {name: "system-info"})

