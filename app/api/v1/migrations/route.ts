import { NextResponse } from "next/server";
import controller from "@/infra/controller";
import migrator from "@/models/migrator";

export const GET = controller.errorHandler(async () => {
  await migrator.runMigrations();

  return NextResponse.json({ message: "Todas as migrations foram executadas com sucesso!" });
});
