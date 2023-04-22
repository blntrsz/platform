import * as cdk from "aws-cdk-lib";
import * as gateway from "aws-cdk-lib/aws-apigateway";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { Runtime } from "aws-cdk-lib/aws-lambda";

export class WebhookHandler extends Construct {
  api: cdk.aws_apigateway.RestApi;
  lambda: cdk.aws_lambda_nodejs.NodejsFunction;
  constructor(
    scope: Construct,
    id: string,
    creatorProjectName: string,
    destroyerProjectName: string
  ) {
    super(scope, id);

    this.api = new gateway.RestApi(this, "api");

    this.lambda = new NodejsFunction(this, "webhook", {
      runtime: Runtime.NODEJS_18_X,
      environment: {
        CREATOR_PROJECT_NAME: creatorProjectName,
        DESTROYER_PROJECT_NAME: destroyerProjectName,
      },
    });

    this.api.root.addMethod("POST", new gateway.LambdaIntegration(this.lambda));
  }
}
