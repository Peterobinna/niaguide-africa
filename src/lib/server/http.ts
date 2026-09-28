import "server-only";
export async function readBody(request: Request): Promise<unknown> {
  const origin = request.headers.get("origin");
  // Next's internal request URL can differ from the incoming host behind a proxy.
  // Compare to Host, which a cross-origin browser cannot forge for this request.
  if (origin && new URL(origin).host !== request.headers.get("host"))
    throw new Error("ORIGIN");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("BODY");
  const decoder = new TextDecoder();
  let text = "";
  let bytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > 8192) {
      await reader.cancel();
      throw new Error("SIZE");
    }
    text += decoder.decode(value, { stream: true });
  }
  text += decoder.decode();
  return JSON.parse(text);
}
export function failure(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}
