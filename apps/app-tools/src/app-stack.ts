import { AppApiStack } from "@platform/app-api";
import { Frontend } from "@platform/app-ui";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    const stage = process.env.STAGE;

    if (!stage) {
      throw new Error("Environment variable STAGE is not defined.");
    }

    const { api } = new AppApiStack(this, "api", { stage });
    new Frontend(
      this,
      "frontend",
      { stage },
      {
        apiUrl: `https://${api.restApiId}.execute-api.${this.region}.amazonaws.com/prod/`,
      }
    );
  }
}
