import { join } from "path";

import { Database, OpenApi } from "@platform/cdk";
import { Construct } from "constructs";

export class Backend extends OpenApi {
  constructor(scope: Construct, id: string, database: Database) {
    super(scope, id, {
      functionsDir: join(__dirname, "src", "functions"),
      // eslint-disable-next-line turbo/no-undeclared-env-vars
      stage: process.env.STAGE ?? "",
      openApiFilePath: join(__dirname, "..", "contract", "api.yaml"),
      database,
      app: "issues",
    });
  }
}
