export async function waitWebServer() {
  const res = await fetch("http://localhost:3000/api/v1/status");

  if (res.status !== 200) {
    throw Error();
  }
}
