/**
 * OpenAI Codex API client — direct implementation.
 * Endpoint: https://chatgpt.com/backend-api/codex/responses (SSE streaming)
 */

import { getValidCredentials } from "../lib/codexAuth";

const CODEX_URL = "https://chatgpt.com/backend-api/codex/responses";
const MODEL = "gpt-5.3-codex";

interface CodexRequest {
  model: string;
  instructions?: string;
  input: InputItem[];
  store: boolean;
  stream: boolean;
  tool_choice: string;
  parallel_tool_calls: boolean;
  tools: never[];
  text: { verbosity: string };
}

type InputItem =
  | { role: "user"; content: [{ type: "input_text"; text: string }] }
  | { role: "assistant"; content: [{ type: "output_text"; text: string }] };

// ── SSE parser ────────────────────────────────────────────────────────────────

async function parseSSEStream(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    let boundary: number;
    while ((boundary = buffer.indexOf("\n\n")) !== -1) {
      const event = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);

      for (const line of event.split("\n")) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6);
        if (data === "[DONE]") break;

        let parsed: Record<string, unknown>;
        try {
          parsed = JSON.parse(data);
        } catch {
          continue;
        }

        const type = parsed.type as string | undefined;

        if (type === "response.output_text.delta") {
          fullText += (parsed.delta as string) ?? "";
        } else if (type === "response.output_text.done" && !fullText) {
          fullText += (parsed.text as string) ?? "";
        } else if (type === "response.completed" && !fullText) {
          // Last-resort fallback
          const output = (parsed as { response?: { output?: Array<{ content?: Array<{ text?: string }> }> } })
            .response?.output?.[0]?.content?.[0]?.text;
          if (output) fullText += output;
        }
      }
    }
  }

  return fullText.trim();
}

// ── Main call ─────────────────────────────────────────────────────────────────

export async function callCodex(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const creds = await getValidCredentials();

  const input: InputItem[] = [
    { role: "user", content: [{ type: "input_text", text: userPrompt }] },
  ];

  const body: CodexRequest = {
    model: MODEL,
    instructions: systemPrompt,
    input,
    store: false,
    stream: true,
    tool_choice: "none",
    parallel_tool_calls: false,
    tools: [],
    text: { verbosity: "medium" },
  };

  const res = await fetch(CODEX_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${creds.access_token}`,
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      "chatgpt-account-id": creds.account_id,
      originator: "simpasar",
      "User-Agent": "pi (darwin; arm64)",
      "OpenAI-Beta": "responses=experimental",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Codex API error ${res.status}: ${err}`);
  }

  if (!res.body) throw new Error("No response body from Codex");

  return parseSSEStream(res.body);
}
