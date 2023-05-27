import { MainPipeline } from "./pipeline/main-pipeline";
import { CreatorCodeBuild, DestroyerCodeBuild } from "./webhook/codebuild";
import { WebhookHandler } from "./webhook/webhook-handler";

import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export class ToolsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const cacheBucket = new cdk.aws_s3.Bucket(this, "CacheBucket", {
      bucketName: "platform-remote-pnpm-cache",
      publicReadAccess: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: cdk.aws_s3.BlockPublicAccess.BLOCK_ALL,
    });

    new MainPipeline(this, "main-pipeline", cacheBucket);

    const creatorCodeBuild = new CreatorCodeBuild(
      this,
      "creator-code-build",
      cacheBucket
    );
    const destroyerCodeBuild = new DestroyerCodeBuild(
      this,
      "destroyer-code-build",
      cacheBucket
    );

    const { lambda } = new WebhookHandler(
      this,
      "webhook",
      creatorCodeBuild.project,
      destroyerCodeBuild.project
    );

    lambda.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "codebuild:StartBuild",
          "codepipeline:StartPipelineExecution",
        ],
        resources: ["*"],
      })
    );
  }
}
