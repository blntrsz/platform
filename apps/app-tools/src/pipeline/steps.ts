import { BuildSpec } from "aws-cdk-lib/aws-codebuild";
import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import {
  BuildEnvironmentVariableType,
  LinuxBuildImage,
  Project,
} from "aws-cdk-lib/aws-codebuild";
import { CodeBuildAction } from "aws-cdk-lib/aws-codepipeline-actions";
import { Construct } from "constructs";

class UnitTestCodebuildAction extends Construct {
  codebuildAction: cdk.aws_codepipeline_actions.CodeBuildAction;
  constructor(
    scope: Construct,
    id: string,
    sourceOutput: cdk.aws_codepipeline.Artifact,
    branch = ""
  ) {
    super(scope, id);

    const buildProject = new Project(this, "build-project", {
      environment: {
        buildImage: LinuxBuildImage.AMAZON_LINUX_2_4,
      },
      environmentVariables: {
        BRANCH: {
          value: branch,
          type: BuildEnvironmentVariableType.PLAINTEXT,
        },
      },
      buildSpec: BuildSpec.fromObject({
        version: "0.2",
        phases: {
          install: {
            "runtime-versions": {
              nodejs: "16",
            },
            commands: ["npm install -g aws-cdk pnpm@7.30.3", "pnpm i"],
          },
          build: {
            commands: ["pnpm test"],
          },
        },
      }),
    });

    buildProject.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["*"],
        resources: ["*"],
      })
    );

    this.codebuildAction = new CodeBuildAction({
      actionName: "test",
      input: sourceOutput,
      project: buildProject,
    });
  }
}

class BuildCodebuildAction extends Construct {
  codebuildAction: cdk.aws_codepipeline_actions.CodeBuildAction;
  constructor(
    scope: Construct,
    id: string,
    sourceOutput: cdk.aws_codepipeline.Artifact,
    branch = ""
  ) {
    super(scope, id);

    const buildProject = new Project(this, "build-project", {
      environment: {
        buildImage: LinuxBuildImage.AMAZON_LINUX_2_4,
      },
      environmentVariables: {
        BRANCH: {
          value: branch,
          type: BuildEnvironmentVariableType.PLAINTEXT,
        },
      },
      buildSpec: BuildSpec.fromObject({
        version: "0.2",
        phases: {
          install: {
            "runtime-versions": {
              nodejs: "16",
            },
            commands: ["npm install -g aws-cdk pnpm@7.30.3", "pnpm i"],
          },
          build: {
            commands: ["pnpm cdk deploy app-$BRANCH --require-approval never"],
          },
        },
      }),
    });

    buildProject.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["*"],
        resources: ["*"],
      })
    );

    this.codebuildAction = new CodeBuildAction({
      actionName: "build",
      input: sourceOutput,
      project: buildProject,
    });
  }
}

export class BuildAndTestCodebuildAction extends Construct {
  codebuildAction: cdk.aws_codepipeline_actions.CodeBuildAction[];
  constructor(
    scope: Construct,
    id: string,
    sourceOutput: cdk.aws_codepipeline.Artifact,
    branch = ""
  ) {
    super(scope, id);

    this.codebuildAction = [
      new BuildCodebuildAction(this, "build-action", sourceOutput, branch)
        .codebuildAction,
      new UnitTestCodebuildAction(
        this,
        "unit-test-action",
        sourceOutput,
        branch
      ).codebuildAction,
    ];
  }
}

export class BuildToolsAction extends Construct {
  codebuildAction: cdk.aws_codepipeline_actions.CodeBuildAction;
  constructor(
    scope: Construct,
    id: string,
    sourceOutput: cdk.aws_codepipeline.Artifact
  ) {
    super(scope, id);

    const buildProject = new Project(this, "build-project", {
      environment: {
        buildImage: LinuxBuildImage.AMAZON_LINUX_2_4,
      },
      buildSpec: BuildSpec.fromObject({
        version: "0.2",
        phases: {
          install: {
            "runtime-versions": {
              nodejs: "16",
            },
            commands: ["npm install -g aws-cdk pnpm@7.30.3", "pnpm i"],
          },
          build: {
            commands: ["pnpm cdk deploy tools --require-approval never"],
          },
        },
      }),
    });

    buildProject.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["*"],
        resources: ["*"],
      })
    );

    this.codebuildAction = new CodeBuildAction({
      actionName: "build-tool-action",
      input: sourceOutput,
      project: buildProject,
    });
  }
}
