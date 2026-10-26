import fastifyPostgres from "@fastify/postgres";
import fastify from "fastify";
import infoPlugin from "./plugins/info.js";
import usersRoutes from "./modules/users/users.routes.js";
// import cookie from "@fastify/cookie";
import startSession from "./modules/sessions/session.js";
import sessionsRoutes from "./modules/sessions/sessions.routes.js";

const app = fastify({ logger: true });



const listeningPort = Number(process.env.PORT);
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

app.register(startSession)
app.register(infoPlugin)
app.register(usersRoutes, { prefix: "/identity" });
app.register(sessionsRoutes, { prefix: "/sessions" })
app.get("/qr/claim", async (_request, reply) => {
    reply
        .header("Cache-Control", "no-store")
        .header("Referrer-Policy", "no-referrer")
        .type("text/html; charset=utf-8")
        .send(`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Claim session</title>
  <style>
    body { font-family: system-ui, sans-serif; display: grid; place-items: center; min-height: 100vh; margin: 0; }
    p { font-size: 1.1rem; }
  </style>
</head>
<body>
  <p id="msg">Claiming session…</p>
  <script>
    (async () => {
      const msg = document.getElementById("msg");
      const token = new URLSearchParams(location.hash.slice(1)).get("token");
      history.replaceState(null, "", location.pathname); // wipe token from URL bar

      if (!token) { msg.textContent = "No token in link."; return; }

      try {
        const res = await fetch("/sessions/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        msg.textContent = res.ok
          ? "✅ Session claimed. You can close this."
          : "❌ " + (data.message ?? "Claim failed");
      } catch {
        msg.textContent = "❌ Could not reach server.";
      }
    })();
  </script>
</body>
</html>`);
});

// app.get('/health', async () => {
//     const { rows } = await app.pg.query('SELECT NOW() as now')
//     return { status: 'ok', dbTime: rows[0].now }
// });

await app.listen({ port: listeningPort, host: '0.0.0.0' })

for (const sig of ["SIGINT", 'SIGTERM']) {
    process.on(sig, async () => {
        await app.close();
        process.exit(0);
    })
};
