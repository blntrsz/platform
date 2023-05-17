import { AbstractPipeline } from "./pipeline/abstract-pipeline";
import { BuildAndTestCodebuildAction, E2EAction } from "./pipeline/steps";

import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export class DeployPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cachedBucket = cdk.aws_s3.Bucket.fromBucketName(
      this,
      "CacheBucket",
      "platform-remote-pnpm-cache"
    );

    const { pipeline, sourceOutput } = new AbstractPipeline(
      this,
      "pipeline",
      process.env.BRANCH
    );

    pipeline.addStage({
      stageName: "build-and-test",
      actions: new BuildAndTestCodebuildAction(
        this,
        "build-and-test-actions",
        sourceOutput,
        process.env.BRANCH,
        cachedBucket
      ).codebuildAction,
    });

    pipeline.addStage({
      stageName: "e2e",
      actions: [
        new E2EAction(
          this,
          "e2e",
          sourceOutput,
          process.env.BRANCH,
          cachedBucket
        ).codebuildAction,
      ],
    });
  }
}
