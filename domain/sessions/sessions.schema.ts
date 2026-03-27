import z from "zod";

export const createSessionSchema = z.object({
  email: z.string().email({ message: "Email inválido." }),
  password: z.string().min(1, "A senha é obrigatória."),
});

export type CreateSessionSchema = z.infer<typeof createSessionSchema>;
