import { NextResponse } from "next/server";
import { InternalServerError, MethodNotAllowedError, ServiceError, ValidationError } from "./errors";

function errorHandler(handler: (req: Request) => Promise<Response> | Response) {
  return async (req: Request): Promise<Response> => {
    try {
      return await handler(req);
    } catch (error) {
      if (error instanceof ServiceError || error instanceof ValidationError || error instanceof MethodNotAllowedError) {
        return new NextResponse(JSON.stringify(error), { status: error.statusCode });
      }

      const publicError = new InternalServerError({ cause: error });
      console.error(publicError);
      return new NextResponse(JSON.stringify(publicError), { status: publicError.statusCode });
    }
  };
}

const controller = {
  errorHandler: errorHandler,
};

export default controller;
