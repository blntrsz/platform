import { PipelineBuilder } from "@platform/cdk";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export class MainPipeline extends Construct {
  constructor(scope: Construct, id: string, cache: Bucket) {
    super(scope, id);

    new PipelineBuilder(this, "pipeline", "host", cache)
      .addStage({
        stage: "dev",
        stageName: "update-tools",
        actions: ["buildTools"],
      })
      .addStage({
        stageName: "lint-test-build-dev",
        stage: "dev",
        actions: ["lint", "unitTest", "build"],
      })
      .addStage({
        stageName: "e2e-dev",
        stage: "dev",
        actions: ["e2e"],
      })
      .addStage({
        stageName: "promote-to-prod",
        stage: "dev",
        actions: ["manualApproval"],
      })
      .addStage({
        stageName: "lint-test-build-prod",
        stage: "prod",
        actions: ["lint", "unitTest", "build"],
      })
      .addStage({
        stageName: "e2e-prod",
        stage: "prod",
        actions: ["e2e"],
      });
  }
}
