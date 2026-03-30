/**
 * OpenAI Codex OAuth PKCE flow — independent implementation for PasarSim.
 * Stores credentials in apps/api/codex-credentials.json
 */

import { createHash, randomBytes } from "crypto";
import { join } from "path";

const AUTH_URL = "https://auth.openai.com/oauth/authorize";
const TOKEN_URL = "https://auth.openai.com/oauth/token";
const REDIRECT_URI = "http://localhost:1455/auth/callback";
const CLIENT_ID = "app_EMoamEEZ73f0CkXaXp7hrann";
const CREDENTIALS_PATH = join(import.meta.dir, "../../codex-credentials.json");

export interface CodexCredentials {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  account_id: string;
}

// ── PKCE helpers ─────────────────────────────────────────────────────────────

function generateVerifier(): string {
  return randomBytes(32).toString("base64url");
}

function generateChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

function generateState(): string {
  return randomBytes(16).toString("base64url");
}

// ── JWT account_id extraction ─────────────────────────────────────────────────

export function extractAccountId(token: string): string {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT");
  const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
  const id =
    payload["https://api.openai.com/auth"]?.chatgpt_account_id ??
    payload.account_id ??
    payload.sub;
  if (!id) throw new Error("account_id not found in JWT");
  return id;
}

// ── Credentials storage ───────────────────────────────────────────────────────

export async function saveCredentials(creds: CodexCredentials): Promise<void> {
  await Bun.write(CREDENTIALS_PATH, JSON.stringify(creds, null, 2));
}

export async function loadCredentials(): Promise<CodexCredentials | null> {
  const file = Bun.file(CREDENTIALS_PATH);
  if (!(await file.exists())) return null;
  return file.json();
}

export function isExpired(creds: CodexCredentials): boolean {
  const expires = new Date(creds.expires_at).getTime();
  return Date.now() >= expires - 60_000; // 1 min buffer
}

// ── Token refresh ─────────────────────────────────────────────────────────────

export async function refreshToken(creds: CodexCredentials): Promise<CodexCredentials> {
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: CLIENT_ID,
    refresh_token: creds.refresh_token,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) throw new Error(`Token refresh failed: ${await res.text()}`);

  const data = await res.json() as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };

  const updated: CodexCredentials = {
    access_token: data.access_token,
    refresh_token: data.refresh_token ?? creds.refresh_token,
    expires_at: new Date(Date.now() + (data.expires_in ?? 3600) * 1000).toISOString(),
    account_id: extractAccountId(data.access_token),
  };

  await saveCredentials(updated);
  return updated;
}

// ── Get valid credentials (auto-refresh) ─────────────────────────────────────

export async function getValidCredentials(): Promise<CodexCredentials> {
  let creds = await loadCredentials();
  if (!creds) throw new Error("Not logged in. Run: bun run login:codex");
  if (isExpired(creds)) {
    console.log("[codex] Token expired, refreshing...");
    creds = await refreshToken(creds);
  }
  return creds;
}

// ── OAuth login flow ──────────────────────────────────────────────────────────

export async function loginCodex(): Promise<void> {
  const verifier = generateVerifier();
  const challenge = generateChallenge(verifier);
  const state = generateState();

  const authUrl =
    `${AUTH_URL}?client_id=${CLIENT_ID}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent("openid profile email offline_access")}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&state=${state}` +
    `&code_challenge=${challenge}` +
    `&code_challenge_method=S256` +
    `&id_token_add_organizations=true` +
    `&codex_cli_simplified_flow=true`;

  console.log("\nBuka URL ini di browser:\n");
  console.log(authUrl);
  console.log("\nSetelah login, paste redirect URL (atau code) di sini:");

  // Start callback server to catch the redirect
  const { code, receivedState } = await Promise.race([
    listenForCallback(),
    readFromStdin(),
  ]);

  if (receivedState && receivedState !== state) {
    throw new Error("State mismatch — possible CSRF attack");
  }

  // Exchange code for tokens
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: CLIENT_ID,
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: verifier,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) throw new Error(`Token exchange failed: ${await res.text()}`);

  const data = await res.json() as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };

  const creds: CodexCredentials = {
    access_token: data.access_token,
    refresh_token: data.refresh_token ?? "",
    expires_at: new Date(Date.now() + (data.expires_in ?? 3600) * 1000).toISOString(),
    account_id: extractAccountId(data.access_token),
  };

  await saveCredentials(creds);
  console.log("\n✓ Login berhasil! Credentials tersimpan.");
}

// ── Callback server ───────────────────────────────────────────────────────────

async function listenForCallback(): Promise<{ code: string; receivedState?: string }> {
  return new Promise((resolve, reject) => {
    const server = Bun.serve({
      port: 1455,
      fetch(req) {
        const url = new URL(req.url);
        if (url.pathname === "/auth/callback") {
          const code = url.searchParams.get("code");
          const receivedState = url.searchParams.get("state") ?? undefined;
          if (code) {
            resolve({ code, receivedState });
            server.stop();
            return new Response(SUCCESS_HTML, {
              headers: { "Content-Type": "text/html" },
            });
          }
          reject(new Error("No code in callback"));
          server.stop();
          return new Response("No code", { status: 400 });
        }
        return new Response("Not found", { status: 404 });
      },
    });

    // Timeout after 5 minutes
    setTimeout(() => {
      server.stop();
      reject(new Error("Callback timeout"));
    }, 300_000);
  });
}

async function readFromStdin(): Promise<{ code: string; receivedState?: string }> {
  return new Promise((resolve) => {
    process.stdin.once("data", (data) => {
      const input = data.toString().trim();
      if (input.startsWith("http")) {
        const url = new URL(input);
        const code = url.searchParams.get("code") ?? input;
        const receivedState = url.searchParams.get("state") ?? undefined;
        resolve({ code, receivedState });
      } else {
        resolve({ code: input });
      }
    });
  });
}

const SUCCESS_HTML = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Login Berhasil</title>
<style>body{font-family:system-ui;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#0a0a0f;color:#fff;}
.box{text-align:center;background:#1e293b;padding:3rem;border-radius:1rem;border:1px solid #10b981;}
h1{color:#10b981;}</style></head>
<body><div class="box"><h1>✓ Login Berhasil!</h1><p>Tutup tab ini dan kembali ke terminal.</p></div></body>
</html>`;
