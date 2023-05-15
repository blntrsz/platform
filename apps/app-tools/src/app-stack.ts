import { Frontend } from "./app/frontend";

import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

// import { Backend } from "@platform/app";

// const appName = "app";

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new Frontend(this, "frontend");
    // new Backend(this, "backend", process.env.BRANCH ?? "");
  }
}
