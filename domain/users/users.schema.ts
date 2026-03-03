import z from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Senha deve ter no mínimo 8 caracteres")
  .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
  .regex(/[^a-zA-Z0-9]/, "Senha deve conter pelo menos um caractere especial");

export const createUserSchema = z.object({
  email: z.email({ message: "Email inválido." }),
  password: passwordSchema,
});

export type CreateUserSchema = z.infer<typeof createUserSchema>;
