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

class AbstractCodeBuildProject extends Construct {
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
              "npm install -g aws-cdk pnpm@7.32.2",
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

class UnitTestCodebuildAction extends AbstractCodeBuildProject {
  codebuildAction: cdk.aws_codepipeline_actions.CodeBuildAction;
  constructor(
    scope: Construct,
    id: string,
    configs: Omit<AbstractCodeBuildProjectConfig, "buildCommands">
  ) {
    super(scope, id, {
      ...configs,
      buildCommands: ["pnpm test"],
    });
  }
}

class BuildCodebuildAction extends AbstractCodeBuildProject {
  codebuildAction: cdk.aws_codepipeline_actions.CodeBuildAction;
  constructor(
    scope: Construct,
    id: string,
    configs: Omit<AbstractCodeBuildProjectConfig, "buildCommands">
  ) {
    super(scope, id, {
      ...configs,
      buildCommands: ["pnpm cdk deploy app-$STAGE --require-approval never"],
    });
  }
}

class LintCodebuildAction extends AbstractCodeBuildProject {
  codebuildAction: cdk.aws_codepipeline_actions.CodeBuildAction;
  constructor(
    scope: Construct,
    id: string,
    configs: Omit<AbstractCodeBuildProjectConfig, "buildCommands">
  ) {
    super(scope, id, {
      ...configs,
      buildCommands: ["pnpm lint"],
    });
  }
}

export class LintBuildAndTestCodebuildAction extends Construct {
  codebuildAction: cdk.aws_codepipeline_actions.CodeBuildAction[];
  constructor(
    scope: Construct,
    id: string,
    {
      source,
      cache,
      stage,
    }: Omit<AbstractCodeBuildProjectConfig, "buildCommands">
  ) {
    super(scope, id);

    this.codebuildAction = [
      new LintCodebuildAction(this, "lint-action", {
        source,
        cache,
        stage,
      }).codebuildAction,
      new BuildCodebuildAction(this, "build-action", {
        source,
        cache,
        stage,
      }).codebuildAction,
      new UnitTestCodebuildAction(this, "unit-test-action", {
        source,
        stage,
        cache,
      }).codebuildAction,
    ];
  }
}

export class BuildToolsAction extends AbstractCodeBuildProject {
  codebuildAction: cdk.aws_codepipeline_actions.CodeBuildAction;
  constructor(
    scope: Construct,
    id: string,
    configs: Omit<AbstractCodeBuildProjectConfig, "buildCommands">
  ) {
    super(scope, id, {
      ...configs,
      buildCommands: ["pnpm cdk deploy tools --require-approval never"],
    });
  }
}

export class E2EAction extends AbstractCodeBuildProject {
  codebuildAction: cdk.aws_codepipeline_actions.CodeBuildAction;
  constructor(
    scope: Construct,
    id: string,
    configs: Omit<AbstractCodeBuildProjectConfig, "buildCommands">
  ) {
    super(scope, id, {
      ...configs,
      extraInstallCommands: ["pnpm dlx playwright install --with-deps"],
      buildCommands: [
        `export E2E_URL=https://$(aws cloudformation describe-stacks --stack-name app-${configs.stage} --query 'Stacks[0].Outputs[?ExportName==\`frontendUrl-${configs.stage}\`].OutputValue' --output text) && echo $E2E_URL && pnpm e2e:test`,
      ],
    });
  }
}
