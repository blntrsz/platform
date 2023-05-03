import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as iam from "aws-cdk-lib/aws-iam";
import * as cdk from "aws-cdk-lib";
import { LinuxBuildImage } from "aws-cdk-lib/aws-codebuild";
import { Construct } from "constructs";
import { Bucket } from "aws-cdk-lib/aws-s3";

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

  constructor(scope: Construct, id: string, cacheBucket: Bucket) {
    super(scope, id);

    this.project = new codebuild.Project(this, "codebuild", {
      cache: cdk.aws_codebuild.Cache.bucket(cacheBucket),
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
              "git checkout $BRANCH --",
              "npm i -g pnpm@7.32.2",
              "pnpm i",
            ],
          },
          build: {
            commands: [
              "pnpm cdk deploy pipeline-$BRANCH --require-approval never",
            ],
          },
        },
        cache: {
          paths: ["/codebuild/output/.pnpm-store/v3/**/*"],
        },
      }),
    });

    this.project.addToRolePolicy(policy);
  }
}

export class DestroyerCodeBuild extends Construct {
  project: codebuild.Project;

  constructor(scope: Construct, id: string, cacheBucket: Bucket) {
    super(scope, id);

    this.project = new codebuild.Project(this, "codebuild", {
      cache: cdk.aws_codebuild.Cache.bucket(cacheBucket),
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
        cache: {
          paths: ["/codebuild/output/.pnpm-store/v3/**/*"],
        },
      }),
    });

    this.project.addToRolePolicy(policy);
  }
}
