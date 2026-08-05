/**
 * Warm the local Ollama model when the server boots so the first coach tip,
 * chat, or receipt scan doesn't pay the cold model-load cost.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY) return;

  const host = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
  const model = process.env.OLLAMA_MODEL || "llama3.2:3b";

  void fetch(`${host}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      keep_alive: "24h",
      options: { num_predict: 1 },
      messages: [{ role: "user", content: "hi" }],
    }),
  }).catch(() => undefined);
}
