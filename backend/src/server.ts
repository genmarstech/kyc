import fastifyPostgres from "@fastify/postgres";
import fastify from "fastify";
import infoPlugin from "./plugins/info.js";
import usersRoutes from "./modules/users/users.routes.js";


const app = fastify({logger: true});



const listeningPort  = Number(process.env.PORT);
const databaseConnection = process.env.DATABASE_URL;

if (!process.env.PORT || Number.isNaN(listeningPort)) {
  throw new Error("PORT env variable is missing or not a valid number")
};

if (!process.env.DATABASE_URL || Number.isNaN(databaseConnection)) {
  throw new Error("PORT env variable is missing or not a valid number")
};

await app.register(fastifyPostgres, {
    connectionString: databaseConnection
});

app.register(infoPlugin)
app.register(usersRoutes, { prefix: "/users"});

app.get('/health', async () => {
    const { rows } = await app.pg.query('SELECT NOW() as now')
    return { status: 'ok', dbTime: rows[0].now}
});

try {
    await app.listen({port: listeningPort, host: '0.0.0.0'})
} catch (error) {
    app.log.error(error)
    process.exit(1)
};