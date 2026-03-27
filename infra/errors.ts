import { NextResponse } from "next/server";

type CustomErrorOptions = {
  cause?: unknown;
  message?: string;
  action?: string;
  statusCode?: number;
};

export class CustomError extends Error {
  public readonly action: string;
  public readonly statusCode: number;

  constructor(message: string, options?: CustomErrorOptions) {
    super(message, { cause: options?.cause });
    this.name = new.target.name;
    this.action = options?.action || "Tente novamente.";
    this.statusCode = options?.statusCode || 400;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      statusCode: this.statusCode,
    };
  }
}

export class InternalServerError extends CustomError {
  constructor({ cause }: CustomErrorOptions) {
    super("Aconteceu um erro interno no servidor.", {
      cause,
      action: "Tente novamente mais tarde ou contate o suporte.",
      statusCode: 500,
    });
  }
}

export class ValidationError extends CustomError {
  constructor(message: string, options?: CustomErrorOptions) {
    super(message || "Erro de validação.", {
      action: options?.action || "Verifique os dados enviados e tente novamente.",
      statusCode: 400,
    });
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message?: string) {
    super(message || "Credenciais inválidas.", {
      action: "Verifique o e-mail e a senha informados.",
      statusCode: 401,
    });
  }
}

export class ServiceError extends CustomError {
  constructor() {
    super("Serviço indisponível no momento.", {
      statusCode: 503,
    });
  }
}

export class MethodNotAllowedError extends CustomError {
  constructor() {
    super("Método não permitido para este endpoint.", {
      statusCode: 405,
    });
  }
}

export function methodNotAllowedResponse() {
  const error = new MethodNotAllowedError();
  return new NextResponse(JSON.stringify(error), { status: error.statusCode });
}
