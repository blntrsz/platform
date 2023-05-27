import { AbstractPipeline } from "./abstract-pipeline";
import { AbstractCodeBuildProject } from "./steps";

import { Artifact, Pipeline } from "aws-cdk-lib/aws-codepipeline";
import {
  CodeBuildAction,
  ManualApprovalAction,
} from "aws-cdk-lib/aws-codepipeline-actions";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

type PredefinedActions =
  | "buildTools"
  | "manualApproval"
  | "e2e"
  | "build"
  | "lint"
  | "unitTest";

export class PipelineBuilder extends Construct {
  pipeline: Pipeline;
  private source: Artifact;
  private cache: IBucket;
  constructor(scope: Construct, id: string, cache: IBucket) {
    super(scope, id);

    const { pipeline, source: source } = new AbstractPipeline(
      this,
      "pipeline",
      "main"
    );
    this.pipeline = pipeline;
    this.source = source;
    this.cache = cache;
  }

  addStage({
    stageName,
    actions,
    stage,
  }: {
    stageName: string;
    actions: PredefinedActions[];
    stage: string;
  }) {
    this.pipeline.addStage({
      stageName,
      actions: this.mapActionsToCodebuildActions(actions, stage),
    });

    return this;
  }

  actionMap: Record<
    PredefinedActions,
    (stage: string) => CodeBuildAction | ManualApprovalAction
  > = {
    buildTools: (stage) =>
      new AbstractCodeBuildProject(this, `build-tools-${stage}`, {
        source: this.source,
        stage,
        cache: this.cache,
        buildCommands: ["pnpm cdk deploy tools --require-approval never"],
      }).codebuildAction,
    manualApproval: (stage) =>
      new ManualApprovalAction({
        actionName: `manual-approval-${stage}`,
      }),
    unitTest: (stage) =>
      new AbstractCodeBuildProject(this, `unit-test-${stage}`, {
        source: this.source,
        stage,
        cache: this.cache,
        buildCommands: ["pnpm test"],
      }).codebuildAction,
    build: (stage) =>
      new AbstractCodeBuildProject(this, `build-${stage}`, {
        source: this.source,
        stage,
        cache: this.cache,
        buildCommands: ["pnpm cdk deploy app-$STAGE --require-approval never"],
      }).codebuildAction,

    e2e: (stage) =>
      new AbstractCodeBuildProject(this, `e2e-${stage}`, {
        source: this.source,
        stage,
        cache: this.cache,
        extraInstallCommands: ["pnpm dlx playwright install --with-deps"],
        buildCommands: [
          `export E2E_URL=https://$(aws cloudformation describe-stacks --stack-name app-${stage} --query 'Stacks[0].Outputs[?ExportName==\`frontendUrl-${stage}\`].OutputValue' --output text) && pnpm e2e:test`,
        ],
      }).codebuildAction,

    lint: (stage) =>
      new AbstractCodeBuildProject(this, `lint-${stage}`, {
        source: this.source,
        stage,
        cache: this.cache,
        buildCommands: ["pnpm lint"],
      }).codebuildAction,
  };

  mapActionsToCodebuildActions(
    actions: PredefinedActions[],
    stage: string
  ): (CodeBuildAction | ManualApprovalAction)[] {
    return actions.map((action) => {
      const codebuildAction = this.actionMap[action](stage);

      if (!codebuildAction) {
        throw new Error(
          `This codebuild action has not been defined ${action}.`
        );
      }

      return codebuildAction;
    });
  }
}
