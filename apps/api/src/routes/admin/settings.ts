import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getSetting, setSetting } from "../../db/queries";
import { SYSTEM_PROMPT } from "../../services/promptBuilder";
import { adminAuth } from "../../middleware/adminAuth";

export const adminSettings = new Hono();

adminSettings.use("*", adminAuth);

// GET /api/admin/settings/prompt
adminSettings.get("/prompt", (c) => {
  const prompt = getSetting("system_prompt") ?? SYSTEM_PROMPT;
  return c.json({ prompt, isCustom: getSetting("system_prompt") !== undefined });
});

// PUT /api/admin/settings/prompt
adminSettings.put("/prompt", zValidator("json", z.object({ prompt: z.string().min(50) })), (c) => {
  const { prompt } = c.req.valid("json");
  setSetting("system_prompt", prompt);
  return c.json({ success: true, prompt });
});

// DELETE /api/admin/settings/prompt — reset ke default
adminSettings.delete("/prompt", (c) => {
  setSetting("system_prompt", SYSTEM_PROMPT);
  return c.json({ success: true, prompt: SYSTEM_PROMPT });
});
