export interface User {
  id: number
  full_name: string
  date_of_birth: string // YYYY-MM-DD
  nationality: string
  address: string
  phone: string
  email: string
  id_number: string
  created_at: string
}

export type CreateUserBody = Omit<User, "id" | "created_at">

export type UserListItem = Pick<
  User,
  "id" | "full_name" | "nationality" | "phone" | "email" | "address" |"created_at"
>