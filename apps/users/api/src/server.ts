import { join } from "path";

import { createLocalApi } from "@platform/local-api";

createLocalApi({
  definitionPath: "node_modules/@platform/users-contract/api.yaml",
  functionsDir: join(__dirname, "functions"),
  port: 9000,
});
