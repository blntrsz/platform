import * as cdk from "aws-cdk-lib";
import { BuildSpec, LinuxBuildImage, Project } from "aws-cdk-lib/aws-codebuild";
import { Artifact, Pipeline } from "aws-cdk-lib/aws-codepipeline";
import {
  CodeBuildAction,
  CodeStarConnectionsSourceAction,
} from "aws-cdk-lib/aws-codepipeline-actions";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

class AbstractCodeBuildProject extends Construct {
  codebuildAction: cdk.aws_codepipeline_actions.CodeBuildAction;
  constructor(
    scope: Construct,
    id: string,
    source: cdk.aws_codepipeline.Artifact
  ) {
    super(scope, id);
    const project = new Project(this, "project", {
      environment: {
        buildImage: LinuxBuildImage.STANDARD_7_0,
      },
      buildSpec: BuildSpec.fromObject({
        version: "0.2",
        phases: {
          build: {
            commands: [""],
          },
        },
      }),
    });

    project.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["*"],
        resources: ["*"],
      })
    );

    this.codebuildAction = new CodeBuildAction({
      actionName: id,
      input: source,
      project: project,
    });
  }
}

export class AbstractPipeline extends Construct {
  pipeline: Pipeline;
  source: Artifact;
  constructor(scope: Construct, id: string, branch?: string) {
    super(scope, id);

    this.pipeline = new Pipeline(this, "pipeline", {
      pipelineName: `pipeline-${branch}`,
    });

    this.source = new Artifact();
    const sourceAction = new CodeStarConnectionsSourceAction({
      actionName: "GithubSource",
      owner: "blntrsz",
      repo: "platform",
      branch,
      output: this.source,
      connectionArn:
        "arn:aws:codestar-connections:eu-central-1:155601209279:connection/51dc3226-ffdd-459d-a034-50f9ff503d2b",
    });

    this.pipeline.addStage({
      stageName: "Source",
      actions: [sourceAction],
    });

    this.pipeline.addStage({
      stageName: "CheckAffected",
      actions: [
        new AbstractCodeBuildProject(this, "asd", this.source).codebuildAction,
      ],
    });
  }
}
