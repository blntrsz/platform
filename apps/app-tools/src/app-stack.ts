import { AppApiStack } from "@platform/app-api";
import { Frontend } from "@platform/app-ui";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    const { api } = new AppApiStack(this, "api");
    new Frontend(this, "frontend", {
      apiUrl: `https://${api.restApiId}.execute-api.${this.region}.amazonaws.com/prod/`,
    });
  }
}
