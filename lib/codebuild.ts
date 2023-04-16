import * as codebuild from "aws-cdk-lib/aws-codebuild";
import {
  BuildEnvironmentVariableType,
  LinuxBuildImage,
} from "aws-cdk-lib/aws-codebuild";
import { Construct } from "constructs";

export class AbstractCodebuild extends Construct {
  gitHubSource: codebuild.ISource;
  project: codebuild.Project;

  constructor(scope: Construct, id: string, shouldCreate: boolean) {
    super(scope, id);

    this.gitHubSource = codebuild.Source.gitHub({
      owner: "blntrsz",
      repo: "platform",
      webhook: false,
    });

    this.project = new codebuild.Project(this, "codebuild", {
      source: this.gitHubSource,
      environment: {
        buildImage: LinuxBuildImage.STANDARD_6_0,
      },
      buildSpec: codebuild.BuildSpec.fromObject({
        version: "0.2",
        phases: {
          install: {
            "runtime-versions": {
              nodejs: "16",
            },
            commands: [
              "echo $BRANCH",
              "echo $ACTION",
              shouldCreate ? "git checkout $BRANCH" : "echo delete stack",
              "npm -v",
              "node -v",
              "npm i -g pnpm",
              "pnpm i",
            ],
          },
          build: {
            commands: [
              shouldCreate
                ? "pnpm cdk synth --ci --all"
                : "pnpm cdk destroy --ci --all",
            ],
          },
        },
      }),
    });
  }
}

export class Codebuild extends Construct {
  creatorCodeBuild: AbstractCodebuild;
  destroyerCodeBuild: AbstractCodebuild;
  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.creatorCodeBuild = new AbstractCodebuild(
      this,
      "creator-code-build",
      true
    );
    this.destroyerCodeBuild = new AbstractCodebuild(
      this,
      "destroyer-code-build",
      false
    );
  }
}
