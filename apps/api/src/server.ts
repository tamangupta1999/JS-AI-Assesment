import "./load-env.js";
import { buildApp } from "./app.js";
import { loadConfig } from "./types.js";

async function main() {
  const config = loadConfig();
  const app = await buildApp(config);

  try {
    await app.listen({ port: config.port, host: "0.0.0.0" });
    console.log(`API server running on http://localhost:${config.port}`);
    console.log(`API docs available at http://localhost:${config.port}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
