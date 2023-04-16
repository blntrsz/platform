import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { Codebuild } from "./codebuild";
import { WebhookHandler } from "./webhook-handler";

export class PlatformStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const { creatorCodeBuild, destroyerCodeBuild } = new Codebuild(
      this,
      "pipeline"
    );
    const { lambda } = new WebhookHandler(
      this,
      "webhook",
      creatorCodeBuild.project.projectName,
      destroyerCodeBuild.project.projectName
    );

    lambda.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["codebuild:StartBuild"],
        resources: [creatorCodeBuild.project.projectArn],
      })
    );
  }
}
