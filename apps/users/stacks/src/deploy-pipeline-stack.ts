import { PipelineBuilder } from "@platform/cdk";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export class UsersDeployPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // eslint-disable-next-line turbo/no-undeclared-env-vars
    const stage = process.env.STAGE;

    if (!stage) {
      throw new Error("Environment variable STAGE is not defined.");
    }

    const cache = cdk.aws_s3.Bucket.fromBucketName(
      this,
      "CacheBucket",
      "platform-remote-pnpm-cache-users"
    );

    new PipelineBuilder(this, "pipeline", "users", cache, stage)
      .addStage({
        stageName: "lint-test-build",
        stage: "dev",
        actions: ["lint", "unitTest", "build"],
      })
      .addStage({
        stageName: "e2e",
        stage: "dev",
        actions: ["e2e"],
      });
  }
}
