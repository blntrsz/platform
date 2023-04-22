import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import {
  BuildEnvironmentVariableType,
  LinuxBuildImage,
  Project,
} from "aws-cdk-lib/aws-codebuild";
import { CodeBuildAction } from "aws-cdk-lib/aws-codepipeline-actions";
import { Construct } from "constructs";
import { AbstractPipeline } from "./pipeline/abstract-pipeline";
import { createBuildSpec, createUnitTestSpec } from "./pipeline/steps";

export class DeployPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const { pipeline, sourceOutput } = new AbstractPipeline(this, "pipeline");

    const buildProject = new Project(this, "build-project", {
      environment: {
        buildImage: LinuxBuildImage.AMAZON_LINUX_2_4,
      },
      environmentVariables: {
        BRANCH: {
          value: process.env.BRANCH,
          type: BuildEnvironmentVariableType.PLAINTEXT,
        },
      },
      buildSpec: createBuildSpec(),
    });

    const unitTestProject = new Project(this, "unit-test-project", {
      environment: {
        buildImage: LinuxBuildImage.AMAZON_LINUX_2_4,
      },
      buildSpec: createUnitTestSpec(),
    });

    buildProject.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["*"],
        resources: ["*"],
      })
    );

    unitTestProject.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["*"],
        resources: ["*"],
      })
    );

    const actions = [
      new CodeBuildAction({
        actionName: "build",
        input: sourceOutput,
        project: buildProject,
      }),
      new CodeBuildAction({
        actionName: "unit-test",
        input: sourceOutput,
        project: unitTestProject,
      }),
    ];

    pipeline.addStage({
      stageName: "build-and-test",
      actions,
    });
  }
}
