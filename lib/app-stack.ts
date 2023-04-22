import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Frontend } from "./frontend";

export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new Frontend(this, "frontend");
  }
}
