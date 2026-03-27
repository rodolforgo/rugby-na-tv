import { NextResponse } from "next/server";
import { InternalServerError, MethodNotAllowedError, ServiceError, UnauthorizedError, ValidationError } from "./errors";

function errorHandler(handler: (req: Request) => Promise<Response> | Response) {
  return async (req: Request): Promise<Response> => {
    try {
      return await handler(req);
    } catch (error) {
      if (error instanceof ServiceError || error instanceof ValidationError || error instanceof UnauthorizedError || error instanceof MethodNotAllowedError) {
        return new NextResponse(JSON.stringify(error), { status: error.statusCode });
      }

      if (error instanceof SyntaxError) {
        const validationError = new ValidationError("O corpo da requisição deve ser um JSON válido.");
        return new NextResponse(JSON.stringify(validationError), { status: validationError.statusCode });
      }

      const publicError = new InternalServerError({ cause: error });
      console.error(publicError);
      return new NextResponse(JSON.stringify(publicError), { status: publicError.statusCode });
    }
  };
}

const controller = {
  errorHandler,
};

export default controller;
