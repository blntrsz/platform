import * as cdk from "aws-cdk-lib";
import {
  BuildEnvironmentVariableType,
  BuildSpec,
  LinuxBuildImage,
  Project,
} from "aws-cdk-lib/aws-codebuild";
import { CodeBuildAction } from "aws-cdk-lib/aws-codepipeline-actions";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

type AbstractCodeBuildProjectConfig = {
  stage: string;
  cache: cdk.aws_s3.IBucket;
  source: cdk.aws_codepipeline.Artifact;
  buildCommands: string[];
  extraInstallCommands?: string[];
};

export class AbstractCodeBuildProject extends Construct {
  codebuildAction: cdk.aws_codepipeline_actions.CodeBuildAction;
  constructor(
    scope: Construct,
    id: string,
    {
      stage,
      cache,
      buildCommands,
      source,
      extraInstallCommands = [],
    }: AbstractCodeBuildProjectConfig
  ) {
    super(scope, id);
    const project = new Project(this, "project", {
      cache: cdk.aws_codebuild.Cache.bucket(cache),
      environment: {
        buildImage: LinuxBuildImage.STANDARD_7_0,
      },
      environmentVariables: {
        STAGE: {
          value: stage,
          type: BuildEnvironmentVariableType.PLAINTEXT,
        },
      },
      buildSpec: BuildSpec.fromObject({
        version: "0.2",
        phases: {
          install: {
            "runtime-versions": {
              nodejs: "18",
            },
            commands: [
              "npm install -g aws-cdk pnpm@8.4.0",
              "pnpm i",
              ...extraInstallCommands,
            ],
          },
          build: {
            commands: buildCommands,
          },
        },
        cache: {
          paths: ["/codebuild/output/.pnpm-store/v3/**/*"],
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
