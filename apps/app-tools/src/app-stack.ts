import { Frontend } from "@platform/app-ui";
import { AppApiStack } from "@platform/app-api";

import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new Frontend(this, "frontend");
    new AppApiStack(this, "api");
  }
}
