import { Database } from "@platform/cdk";
import { Backend } from "@platform/users-api/infra";
import { Frontend } from "@platform/users-ui/infra";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export class UsersAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    // eslint-disable-next-line turbo/no-undeclared-env-vars
    const stage = process.env.STAGE;

    if (!stage) {
      throw new Error("Environment variable STAGE is not defined.");
    }

    const database = new Database(this, "database", `usersDB${stage}`);
    const { api } = new Backend(this, "api", database);
    new Frontend(this, "fronend", {
      region: this.region,
      account: this.account,
      apiUrl: api.urlForPath("/"),
    });
  }
}
