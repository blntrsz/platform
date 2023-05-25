import { join } from "path";

import { OpenApi } from "@platform/cdk";
import { Construct } from "constructs";

export function createBackendIfra(scope: Construct, id: string) {
  return new OpenApi(scope, id, {
    functionsDir: join(__dirname, "src", "functions"),
    stage: process.env.STAGE ?? "",
    openApiFilePath: join(__dirname, "..", "app-contract", "api.yaml"),
  });
}
