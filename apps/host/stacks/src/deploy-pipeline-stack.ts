import { PipelineBuilder } from "@platform/cdk";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export class HostDeployPipelineStack extends cdk.Stack {
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
      "platform-remote-pnpm-cache-host"
    );

    new PipelineBuilder(this, "pipeline", "host", cache)
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
