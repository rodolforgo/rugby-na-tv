import { ValidationError } from "@/infra/errors";
import type { z } from "zod";

function validateBody<T>(schema: z.ZodType<T>, body: unknown) {
  const parsedBody = schema.safeParse(body);

  if (!parsedBody.success) {
    const field = parsedBody.error.issues[0].path[0] as string;
    throw new ValidationError(`O campo ${field} está inválido.`, { action: "Verifique os dados enviados e tente novamente." });
  }
}

const validator = { validateBody };

export default validator;
