import { loginCodex } from "../lib/codexAuth";

console.log("=== PasarSim — OpenAI Codex Login ===\n");

loginCodex()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Login gagal:", err.message);
    process.exit(1);
  });
