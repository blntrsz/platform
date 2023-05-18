import { AbstractPipeline } from "./abstract-pipeline";
import {
  BuildToolsAction,
  E2EAction,
  LintBuildAndTestCodebuildAction,
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

    pipeline.addStage({
      stageName: "build-and-test-dev",
      actions: new LintBuildAndTestCodebuildAction(
        this,
        "dev-build-and-test-actions",
        {
          source,
          stage: "dev",
          cache,
        }
      ).codebuildAction,
    });

    pipeline.addStage({
      stageName: "dev-e2e",
      actions: [
        new E2EAction(this, "dev-e2e", {
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

    pipeline.addStage({
      stageName: "build-and-test-prod",
      actions: new LintBuildAndTestCodebuildAction(
        this,
        "prod-build-and-test-actions",
        {
          source,
          stage: "prod",
          cache,
        }
      ).codebuildAction,
    });

    pipeline.addStage({
      stageName: "prod-e2e",
      actions: [
        new E2EAction(this, "prod-e2e", {
          source,
          stage: "prod",
          cache,
        }).codebuildAction,
      ],
    });
  }
}
