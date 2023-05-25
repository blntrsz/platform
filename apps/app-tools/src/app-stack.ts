import { createBackendIfra } from "@platform/app-api/infra";
import { createFrontendInfra } from "@platform/app-ui/infra";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    const stage = process.env.STAGE;

    if (!stage) {
      throw new Error("Environment variable STAGE is not defined.");
    }

    const { api } = createBackendIfra(this, "api");
    createFrontendInfra(this, "fronend", api.urlForPath("/"));
  }
}
