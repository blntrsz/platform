import { Frontend } from "@platform/host-ui/infra";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export class HostAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    // eslint-disable-next-line turbo/no-undeclared-env-vars
    const stage = process.env.STAGE;

    if (!stage) {
      throw new Error("Environment variable STAGE is not defined.");
    }

    new Frontend(this, "fronend", {
      region: this.region,
      account: this.account,
    });
  }
}
