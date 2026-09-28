/* eslint-disable @typescript-eslint/no-require-imports -- Isolated CommonJS test runner for Windows environments where tsx cannot read the OS user profile. */
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
require.extensions[".ts"] = (module, filename) => {
  const source = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  });
  module._compile(output.outputText, filename);
};
require(path.resolve(process.argv[2] || "tests/grounding.test.ts"));
