import "dotenv/config";
import express, { type NextFunction, type Request, type Response } from "express";
import { createServer as createViteServer } from "vite";
import { z } from "zod";

import { getPublicClient } from "./supabase-public.server";
import { getOverview, runImport } from "./import.server";

const app = express();
const port = Number(process.env["PORT"] ?? 3000);
const isProduction = process.env["NODE_ENV"] === "production";

app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (_request, response) => response.json({ ok: true }));

app.get("/api/products", async (request, response, next) => {
  try {
    const filters = z
      .object({
        query: z.string().max(120).optional().default(""),
        category: z.string().max(80).optional().default(""),
        limit: z.coerce.number().int().min(1).max(60).optional().default(36),
      })
      .parse(request.query);
    const supabase = getPublicClient();
    let productQuery = supabase
      .from("products")
      .select("id, product_name, price, image_url, sku, category, updated_at")
      .eq("is_active", true)
      .order("product_name", { ascending: true })
      .limit(filters.limit);
    if (filters.query.trim()) productQuery = productQuery.ilike("product_name", `%${filters.query.trim()}%`);
    if (filters.category) productQuery = productQuery.eq("category", filters.category);
    const { data, error } = await productQuery;
    if (error) throw new Error(error.message);
    response.json(data ?? []);
  } catch (error) {
    next(error);
  }
});

app.get("/api/categories", async (_request, response, next) => {
  try {
    const { data, error } = await getPublicClient()
      .from("products")
      .select("category")
      .eq("is_active", true)
      .not("category", "is", null);
    if (error) throw new Error(error.message);
    response.json(Array.from(new Set((data ?? []).map((row) => row.category as string))).sort());
  } catch (error) {
    next(error);
  }
});

function requireAdmin(passcode: string) {
  if (!process.env["ADMIN_PASSCODE"] || passcode !== process.env["ADMIN_PASSCODE"]) {
    throw new Error("Invalid admin passcode");
  }
}

app.post("/api/admin/overview", async (request, response, next) => {
  try {
    const { passcode } = z.object({ passcode: z.string().min(1) }).parse(request.body);
    requireAdmin(passcode);
    response.json(await getOverview());
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/import", async (request, response, next) => {
  try {
    const input = z
      .object({
        passcode: z.string().min(1),
        fileName: z.string().max(200).optional(),
        deactivateMissing: z.boolean().optional().default(false),
        rows: z
          .array(z.object({
            product_name: z.string().min(1),
            price: z.number().nonnegative(),
            image_url: z.string().nullable().optional(),
            sku: z.string().nullable().optional(),
            category: z.string().nullable().optional(),
          }))
          .min(1)
          .max(5000),
      })
      .parse(request.body);
    requireAdmin(input.passcode);
    const { passcode: _passcode, ...importInput } = input;
    response.json(await runImport(importInput));
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  const message = error instanceof Error ? error.message : "Request failed";
  response.status(message === "Invalid admin passcode" ? 401 : 400).json({ error: message });
});

async function start() {
  if (isProduction) {
    app.use(express.static("dist/client"));
    app.use((_request, response) => response.sendFile("index.html", { root: "dist/client" }));
  } else {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  }
  app.listen(port, () => {
    console.log(`Server connected successfully: http://localhost:${port}`);
  });
}

void start();
