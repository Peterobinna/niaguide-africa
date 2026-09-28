/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node setup script. */
const fs = require("node:fs");
const path = require("node:path");
const target = path.resolve(__dirname, "..", ".env.local");
try {
  fs.writeFileSync(target, "NEXT_PUBLIC_DEMO_MODE=true\n", { flag: "wx" });
  console.log("Demo configured. Run npm run dev and open http://localhost:3000.");
} catch (error) {
  if (error.code === "EEXIST") {
    console.error(".env.local already exists and was left unchanged. Review it before starting; a demo-only configuration needs NEXT_PUBLIC_DEMO_MODE=true and no live credentials.");
  } else {
    console.error("Could not create the demo configuration:", error.code);
  }
  process.exitCode = 1;
}
