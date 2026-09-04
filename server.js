import { spawn } from "node:child_process";
import process from "node:process";

const child = spawn(
  process.execPath,
  ["node_modules/tsx/dist/cli.mjs", "backend/server.ts"],
  { stdio: "inherit", env: process.env },
);

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 1);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}
