import type { FastifyInstance } from "fastify"
import type { CreateUserBody, User, UserListItem } from "./users.types.js"

type Db = FastifyInstance["pg"]

export class UserAlreadyExistsError extends Error {
  constructor() {
    super("Email or ID number already exists")
  }
}

// ::text on the date avoids JS timezone shifting it by a day
const COLUMNS = `id, full_name, date_of_birth::text AS date_of_birth,
  nationality, address, phone, email, id_number, created_at`

const LIST_COLUMNS = `id, full_name, nationality, phone, email, address, created_at`

export const createUsersRepository = (db: Db) => ({
  async create(b: CreateUserBody): Promise<User> {
    try {
      const { rows } = await db.query<User>(
        `INSERT INTO users
           (full_name, date_of_birth, nationality, address, phone, email, id_number)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING ${COLUMNS}`,
        [
          b.full_name.trim(), b.date_of_birth, b.nationality.trim(),
          b.address.trim(), b.phone, b.email.toLowerCase(), b.id_number.trim(),
        ]
      )

      const user = rows[0]

      if (!user) {
        throw new Error("Failed to create user. no rows returned")
      }

      return user;
    } catch (err: any) {
      if (err.code === "23505") throw new UserAlreadyExistsError()
      throw err
    }
  },

  async list(limit = 50): Promise<UserListItem[]> {
    const { rows } = await db.query<UserListItem>(
      `SELECT ${LIST_COLUMNS} FROM users ORDER BY created_at DESC LIMIT $1`,
      [limit]
    )
    return rows
  },

  async findById(id: number): Promise<User | null> {
    const { rows } = await db.query<User>(
      `SELECT ${COLUMNS} FROM users WHERE id = $1`,
      [id]
    )
    return rows[0] ?? null
  },
})

export type UsersRepository = ReturnType<typeof createUsersRepository>