import * as cdk from "aws-cdk-lib";
import * as gateway from "aws-cdk-lib/aws-apigateway";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

export class WebhookHandler extends Construct {
  api: cdk.aws_apigateway.RestApi;
  lambda: cdk.aws_lambda_nodejs.NodejsFunction;
  constructor(
    scope: Construct,
    id: string,
    creatorProjectName: codebuild.Project,
    destroyerProjectName: codebuild.Project,
    app: string
  ) {
    super(scope, id);

    this.api = new gateway.RestApi(this, "api");

    this.lambda = new NodejsFunction(this, "webhook", {
      runtime: Runtime.NODEJS_18_X,
      environment: {
        CREATOR_PROJECT_NAME: creatorProjectName.projectName,
        DESTROYER_PROJECT_NAME: destroyerProjectName.projectName,
        APP: app,
      },
    });

    this.api.root.addMethod("POST", new gateway.LambdaIntegration(this.lambda));
  }
}
