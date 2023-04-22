import * as pipelines from "aws-cdk-lib/pipelines";
import * as pip from "aws-cdk-lib/aws-codepipeline";
import { Construct } from "constructs";
import { CodeStarConnectionsSourceAction } from "aws-cdk-lib/aws-codepipeline-actions";
import { Artifact } from "aws-cdk-lib/aws-codepipeline";

export class AbstractPipeline extends Construct {
  pipeline: pip.Pipeline;
  sourceOutput: pip.Artifact;
  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.pipeline = new pip.Pipeline(this, "asd", {
      pipelineName: "pipeline",
    });

    this.sourceOutput = new Artifact();
    const sourceAction = new CodeStarConnectionsSourceAction({
      actionName: "GithubSource",
      owner: "blntrsz",
      repo: "platform",
      branch: process.env.BRANCH,
      output: this.sourceOutput,
      connectionArn:
        "arn:aws:codestar-connections:eu-central-1:155601209279:connection/51dc3226-ffdd-459d-a034-50f9ff503d2b",
    });

    this.pipeline.addStage({
      stageName: "Source",
      actions: [sourceAction],
    });
  }
}
