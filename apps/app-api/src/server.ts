import { join } from "path";

import { createLocalApi } from "@platform/local-api";

createLocalApi({
  definitionPath: "node_modules/@platform/app-contract/api.yaml",
  functionsDir: join(__dirname, "functions"),
  port: 9000,
});
