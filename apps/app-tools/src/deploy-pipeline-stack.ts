import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { AbstractPipeline } from "./pipeline/abstract-pipeline";
import { BuildAndTestCodebuildAction } from "./pipeline/steps";

export class DeployPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const { pipeline, sourceOutput } = new AbstractPipeline(
      this,
      "pipeline",
      process.env.BRANCH
    );

    const actions = new BuildAndTestCodebuildAction(
      this,
      "build-and-test-actions",
      sourceOutput,
      process.env.BRANCH
    ).codebuildAction;

    pipeline.addStage({
      stageName: "build-and-test",
      actions,
    });
  }
}
