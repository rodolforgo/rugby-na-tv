export async function clearMailcatcher() {
  await fetch("http://localhost:1080/messages", { method: "DELETE" });
}

export async function getLastVerificationToken(recipientEmail: string): Promise<string> {
  const response = await fetch("http://localhost:1080/messages");
  const messages = await response.json();

  const message = [...messages].reverse().find((m: { recipients: string[] }) => m.recipients.some((r) => r.includes(recipientEmail)));

  if (!message) throw new Error(`Nenhum email encontrado para ${recipientEmail}`);

  const bodyResponse = await fetch(`http://localhost:1080/messages/${message.id}.html`);
  const body = await bodyResponse.text();

  const match = body.match(/token=([a-f0-9-]+)/);
  if (!match) throw new Error("Token não encontrado no email");

  return match[1];
}
