import { waitWebServer } from "@/tests/orchestrator";

beforeAll(async () => {
  await waitWebServer();
});

describe("POST /api/v1/status", () => {
  test("Retorna status 405 MethodNotAlowed", async () => {
    const response = await fetch("http://localhost:3000/api/v1/status", {
      method: "POST",
    });

    expect(response.status).toBe(405);
  });
});
