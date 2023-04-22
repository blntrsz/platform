import { Construct } from "constructs";
import { CodeStarConnectionsSourceAction } from "aws-cdk-lib/aws-codepipeline-actions";
import { Artifact, Pipeline } from "aws-cdk-lib/aws-codepipeline";

export class AbstractPipeline extends Construct {
  pipeline: Pipeline;
  sourceOutput: Artifact;
  constructor(scope: Construct, id: string, branch?: string) {
    super(scope, id);

    this.pipeline = new Pipeline(this, "pipeline", {
      pipelineName: "pipeline",
    });

    this.sourceOutput = new Artifact();
    const sourceAction = new CodeStarConnectionsSourceAction({
      actionName: "GithubSource",
      owner: "blntrsz",
      repo: "platform",
      branch,
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
