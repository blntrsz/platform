import { Construct } from "constructs";
import { AbstractPipeline } from "./abstract-pipeline";
import { BuildAndTestCodebuildAction, BuildToolsAction } from "./steps";

export class MainPipelineStack extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const { pipeline, sourceOutput } = new AbstractPipeline(
      this,
      "pipeline",
      "main"
    );

    pipeline.addStage({
      stageName: "update-tools",
      actions: [
        new BuildToolsAction(this, "build-tools-action", sourceOutput)
          .codebuildAction,
      ],
    });

    const devActions = new BuildAndTestCodebuildAction(
      this,
      "dev-build-and-test-actions",
      sourceOutput,
      "dev"
    ).codebuildAction;

    pipeline.addStage({
      stageName: "build-and-test-dev",
      actions: devActions,
    });

    const prodActions = new BuildAndTestCodebuildAction(
      this,
      "prod-build-and-test-actions",
      sourceOutput,
      "prod"
    ).codebuildAction;

    pipeline.addStage({
      stageName: "build-and-test-prod",
      actions: prodActions,
      transitionToEnabled: false,
    });
  }
}
