import type { FastifyPluginAsync } from "fastify"
import { createUsersRepository } from "./users.repository.js"
import { createUsersHandlers } from "./users.handlers.js"
import { createUserSchema, getUserSchema } from "./users.schema.js"
import type { CreateUserBody } from "./users.types.js"

const usersRoutes: FastifyPluginAsync = async (app) => {
  const repo = createUsersRepository(app.pg)
  const handlers = createUsersHandlers(repo)

  app.post<{ Body: CreateUserBody }>("/", { schema: createUserSchema }, handlers.create)
  app.get("/", handlers.list)
  app.get<{ Params: { id: number } }>("/:id", { schema: getUserSchema }, handlers.getById)
}

export default usersRoutes