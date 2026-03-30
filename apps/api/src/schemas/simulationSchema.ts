import { z } from "zod";

export const simulationRequestSchema = z.object({
  product: z.object({
    name: z.string().min(1).max(100),
    category: z.enum([
      "fnb_beverage",
      "fnb_food",
      "fashion",
      "beauty",
      "electronics",
      "services",
      "other",
    ]),
    description: z.string().min(1).max(500),
    price: z.number().int().positive().max(100_000_000),
    priceUnit: z.enum(["per_piece", "per_cup", "per_portion", "per_kg"]),
  }),
  targetCity: z.enum([
    "malang",
    "bandung",
    "surabaya",
    "yogyakarta",
    "semarang",
  ]),
  additionalContext: z.string().max(300).optional(),
  tier: z.enum(["free", "basic", "pro"]).default("free"),
  paymentTxSignature: z.string().optional(),
  walletAddress: z.string().min(10, "Invalid wallet address").optional(),
});

export type SimulationRequestInput = z.infer<typeof simulationRequestSchema>;
