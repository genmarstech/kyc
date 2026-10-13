import type { FastifyReply, FastifyRequest } from "fastify"
import type { CreateUserBody } from "./users.types.js"
import { UserAlreadyExistsError, type UsersRepository } from "./users.repository.js"

export const createUsersHandlers = (repo: UsersRepository) => ({
  async create(
    req: FastifyRequest<{ Body: CreateUserBody }>,
    reply: FastifyReply
  ) {
    try {
      const user = await repo.create(req.body)
      return reply.code(201).send(user)
    } catch (err) {
      if (err instanceof UserAlreadyExistsError) {
        return reply.code(409).send({ error: err.message })
      }
      throw err
    }
  },

  async list() {
    return repo.list()
  },

  async getById(
    req: FastifyRequest<{ Params: { id: number } }>,
    reply: FastifyReply
  ) {
    const user = await repo.findById(req.params.id)
    if (!user) return reply.code(404).send({ error: "User not found" })
    return user
  },
})