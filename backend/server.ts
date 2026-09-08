import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import { app } from "./app";

const port = Number(process.env["PORT"] ?? 3000);
const isProduction = process.env["NODE_ENV"] === "production";

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
