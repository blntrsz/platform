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
        buildImage: LinuxBuildImage.STANDARD_7_0,
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
        buildImage: LinuxBuildImage.STANDARD_7_0,
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
        buildImage: LinuxBuildImage.STANDARD_7_0,
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
        buildImage: LinuxBuildImage.STANDARD_7_0,
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
            commands: [
              "yum install libasound2 libatk-bridge2.0-0 libatk1.0-0 libatspi2.0-0 libcairo2 libcups2 libdbus-1-3 libdrm2 libgbm1 libglib2.0-0 libnspr4 libnss3 libpango-1.0-0 libwayland-client0 libx11-6 libxcb1 libxcomposite1 libxdamage1 libxext6 libxfixes3 libxkbcommon0 libxrandr2 xvfb fonts-noto-color-emoji fonts-unifont libfontconfig1 libfreetype6 xfonts-cyrillic xfonts-scalable fonts-liberation fonts-ipafont-gothic fonts-wqy-zenhei fonts-tlwg-loma-otf fonts-freefont-ttf ffmpeg libcairo-gobject2 libdbus-glib-1-2 libgdk-pixbuf-2.0-0 libgtk-3-0 libpangocairo-1.0-0 libx11-xcb1 libxcb-shm0 libxcursor1 libxi6 libxrender1 libxtst6 libenchant-2-2 gstreamer1.0-libav gstreamer1.0-plugins-bad gstreamer1.0-plugins-base gstreamer1.0-plugins-good libicu70 libegl1 libepoxy0 libevdev2 libffi7 libgles2 libglx0 libgstreamer-gl1.0-0 libgstreamer-plugins-base1.0-0 libgstreamer1.0-0 libgudev-1.0-0 libharfbuzz-icu0 libharfbuzz0b libhyphen0 libjpeg-turbo8 liblcms2-2 libmanette-0.2-0 libnotify4 libopengl0 libopenjp2-7 libopus0 libpng16-16 libproxy1v5 libsecret-1-0 libsoup2.4-1 libwayland-egl1 libwayland-server0 libwebpdemux2 libwoff1 libxml2 libxslt1.1 libx264-163 libatomic1 libevent-2.1-7",
              "npm install -g aws-cdk pnpm@7.32.2",
              "pnpm i",
            ],
          },
          build: {
            commands: [
              "export E2E_URL=$( aws cloudformation describe-stacks --stack-name app-" +
                branch +
                " --query 'Stacks[0].Outputs[?ExportName==`frontendUrl-" +
                process.env.BRANCH +
                "`].OutputValue' --output text )",
              "npx playwright install",
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
