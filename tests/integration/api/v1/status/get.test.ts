import { statusResponseSchema } from "@/domain/status/status.schema";
import { waitWebServer } from "@/tests/orchestrator";

beforeAll(async () => {
  await waitWebServer();
});

describe("GET /api/v1/status", () => {
  test("Retorna status 200", async () => {
    const response = await fetch("http://localhost:3000/api/v1/status");
    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(statusResponseSchema.safeParse(responseBody)).toBeDefined();
  });
});
