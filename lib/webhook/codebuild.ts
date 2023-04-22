import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as iam from "aws-cdk-lib/aws-iam";
import { LinuxBuildImage } from "aws-cdk-lib/aws-codebuild";
import { Construct } from "constructs";

const githubSource = codebuild.Source.gitHub({
  owner: "blntrsz",
  repo: "platform",
  webhook: false,
});

// TODO: more strict policy
const policy = new iam.PolicyStatement({
  effect: iam.Effect.ALLOW,
  actions: ["*"],
  resources: ["*"],
});

const environment = {
  buildImage: LinuxBuildImage.AMAZON_LINUX_2_4,
};

const runtimeVersion = {
  "runtime-versions": {
    nodejs: "16",
  },
};

const version = "0.2";

export class CreatorCodeBuild extends Construct {
  project: codebuild.Project;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.project = new codebuild.Project(this, "codebuild", {
      source: githubSource,
      environment,
      buildSpec: codebuild.BuildSpec.fromObject({
        version,
        phases: {
          install: {
            ...runtimeVersion,
            commands: [
              "echo $BRANCH",
              "echo $ACTION",
              "npm -v",
              "node -v",
              "git checkout $BRANCH",
              "npm i -g pnpm@7.30.3",
              "pnpm i",
            ],
          },
          build: {
            commands: [
              "pnpm cdk deploy pipeline-$BRANCH --require-approval never",
            ],
          },
        },
      }),
    });

    this.project.addToRolePolicy(policy);
  }
}

export class DestroyerCodeBuild extends Construct {
  project: codebuild.Project;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.project = new codebuild.Project(this, "codebuild", {
      source: githubSource,
      environment,
      buildSpec: codebuild.BuildSpec.fromObject({
        version,
        phases: {
          install: {
            ...runtimeVersion,
            commands: ["echo $BRANCH", "echo $ACTION"],
          },
          build: {
            commands: [
              "aws cloudformation delete-stack --stack-name pipeline-$BRANCH",
              "aws cloudformation delete-stack --stack-name app-$BRANCH",
            ],
          },
        },
      }),
    });

    this.project.addToRolePolicy(policy);
  }
}
