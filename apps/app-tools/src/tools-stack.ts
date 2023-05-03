import { Construct } from "constructs";
import { CreatorCodeBuild, DestroyerCodeBuild } from "./webhook/codebuild";
import { WebhookHandler } from "./webhook/webhook-handler";
import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import { MainPipelineStack } from "./pipeline/main-pipeline";

export class ToolsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new MainPipelineStack(this, "main-pipeline");

    const creatorCodeBuild = new CreatorCodeBuild(this, "creator-code-build");
    const destroyerCodeBuild = new DestroyerCodeBuild(
      this,
      "destroyer-code-build"
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
        actions: ["codebuild:StartBuild"],
        resources: [
          creatorCodeBuild.project.projectArn,
          destroyerCodeBuild.project.projectArn,
        ],
      })
    );
  }
}