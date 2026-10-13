export const createUserSchema = {
  body: {
    type: "object",
    required: [
      "full_name", "date_of_birth", "nationality",
      "address", "phone", "email", "id_number",
    ],
    additionalProperties: false,
    properties: {
      full_name: { type: "string", minLength: 2, maxLength: 150 },
      date_of_birth: { type: "string", format: "date" },
      nationality: { type: "string", minLength: 2, maxLength: 60 },
      address: { type: "string", minLength: 3, maxLength: 255 },
      phone: { type: "string", pattern: "^\\+?[0-9]{9,15}$" },
      email: { type: "string", format: "email" },
      id_number: { type: "string", minLength: 5, maxLength: 20 },
    },
  },
}

export const getUserSchema = {
  params: {
    type: "object",
    properties: { id: { type: "integer" } },
  },
}