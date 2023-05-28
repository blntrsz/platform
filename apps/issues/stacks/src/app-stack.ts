import { Database } from "@platform/cdk";
import { Backend } from "@platform/issues-api/infra";
import { Frontend } from "@platform/issues-ui/infra";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export class IssuesAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    const stage = process.env.STAGE;

    if (!stage) {
      throw new Error("Environment variable STAGE is not defined.");
    }

    const database = new Database(this, "database", `issuesDB${stage}`);
    const { api } = new Backend(this, "api", database);
    new Frontend(this, "fronend", {
      region: this.region,
      account: this.account,
      apiUrl: api.urlForPath("/"),
    });
  }
}
