import { join } from "path";

import { createLocalApi } from "@platform/local-api";

createLocalApi({
  definitionPath: "node_modules/@platform/issues-contract/api.yaml",
  functionsDir: join(__dirname, "functions"),
  port: 9001,
});
