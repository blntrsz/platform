import { AbstractPipeline } from "./abstract-pipeline";
import {
  BuildAndTestCodebuildAction,
  BuildToolsAction,
  E2EAction,
} from "./steps";

import { ManualApprovalAction } from "aws-cdk-lib/aws-codepipeline-actions";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export class MainPipelineStack extends Construct {
  constructor(scope: Construct, id: string, cache: Bucket) {
    super(scope, id);

    const { pipeline, source: source } = new AbstractPipeline(
      this,
      "pipeline",
      "main"
    );

    pipeline.addStage({
      stageName: "update-tools",
      actions: [
        new BuildToolsAction(this, "build-tools-action", {
          source,
          stage: "dev",
          cache,
        }).codebuildAction,
      ],
    });

    const devActions = new BuildAndTestCodebuildAction(
      this,
      "dev-build-and-test-actions",
      {
        source,
        stage: "dev",
        cache,
      }
    ).codebuildAction;

    pipeline.addStage({
      stageName: "build-and-test-dev",
      actions: devActions,
    });

    pipeline.addStage({
      stageName: "e2e",
      actions: [
        new E2EAction(this, "e2e", {
          source,
          stage: "dev",
          cache,
        }).codebuildAction,
      ],
    });

    pipeline.addStage({
      stageName: "promote-to-prod",
      actions: [
        new ManualApprovalAction({
          actionName: "manual-approval",
        }),
      ],
    });

    const prodActions = new BuildAndTestCodebuildAction(
      this,
      "prod-build-and-test-actions",
      {
        source,
        stage: "prod",
        cache,
      }
    ).codebuildAction;

    pipeline.addStage({
      stageName: "build-and-test-prod",
      actions: prodActions,
    });
  }
}
