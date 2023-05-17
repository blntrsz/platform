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

class UnitTestCodebuildAction extends Construct {
  codebuildAction: cdk.aws_codepipeline_actions.CodeBuildAction;
  constructor(
    scope: Construct,
    id: string,
    sourceOutput: cdk.aws_codepipeline.Artifact,
    branch = "",
    cacheBucket: cdk.aws_s3.IBucket
  ) {
    super(scope, id);

    const buildProject = new Project(this, "build-project", {
      cache: cdk.aws_codebuild.Cache.bucket(cacheBucket),
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
            commands: ["npm install -g aws-cdk pnpm@7.32.2", "pnpm i"],
          },
          build: {
            commands: ["pnpm test"],
          },
        },
        cache: {
          paths: ["/codebuild/output/.pnpm-store/v3/**/*"],
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
    branch = "",
    cacheBucket: cdk.aws_s3.IBucket
  ) {
    super(scope, id);

    const buildProject = new Project(this, "build-project", {
      cache: cdk.aws_codebuild.Cache.bucket(cacheBucket),
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
            commands: ["npm install -g aws-cdk pnpm@7.32.2", "pnpm i"],
          },
          build: {
            commands: ["pnpm cdk deploy app-$BRANCH --require-approval never"],
          },
        },
        cache: {
          paths: ["/codebuild/output/.pnpm-store/v3/**/*"],
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
    branch = "",
    cacheBucket: cdk.aws_s3.IBucket
  ) {
    super(scope, id);

    this.codebuildAction = [
      new BuildCodebuildAction(
        this,
        "build-action",
        sourceOutput,
        branch,
        cacheBucket
      ).codebuildAction,
      new UnitTestCodebuildAction(
        this,
        "unit-test-action",
        sourceOutput,
        branch,
        cacheBucket
      ).codebuildAction,
    ];
  }
}

export class BuildToolsAction extends Construct {
  codebuildAction: cdk.aws_codepipeline_actions.CodeBuildAction;
  constructor(
    scope: Construct,
    id: string,
    sourceOutput: cdk.aws_codepipeline.Artifact,
    cacheBucket: cdk.aws_s3.Bucket
  ) {
    super(scope, id);

    const buildProject = new Project(this, "build-project", {
      cache: cdk.aws_codebuild.Cache.bucket(cacheBucket),
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
            commands: ["npm install -g aws-cdk pnpm@7.32.2", "pnpm i"],
          },
          build: {
            commands: ["pnpm cdk deploy tools --require-approval never"],
          },
        },
        cache: {
          paths: ["/codebuild/output/.pnpm-store/v3/**/*"],
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

export class E2EAction extends Construct {
  codebuildAction: cdk.aws_codepipeline_actions.CodeBuildAction;
  constructor(
    scope: Construct,
    id: string,
    sourceOutput: cdk.aws_codepipeline.Artifact,
    branch = "",
    cacheBucket: cdk.aws_s3.IBucket
  ) {
    super(scope, id);

    const buildProject = new Project(this, "build-project", {
      cache: cdk.aws_codebuild.Cache.bucket(cacheBucket),
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
            commands: ["npm install -g aws-cdk pnpm@7.32.2", "pnpm i"],
          },
          build: {
            commands: [
              "export E2E_URL=$( aws cloudformation describe-stacks --stack-name app-" +
                branch +
                " --query 'Stacks[0].Outputs[?ExportName==`frontendUrl-" +
                process.env.BRANCH +
                "`].OutputValue' --output text )",
              "pnpm e2e:install",
              "pnpm e2e:test",
            ],
          },
        },
        cache: {
          paths: ["/codebuild/output/.pnpm-store/v3/**/*"],
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
