import * as cdk from "aws-cdk-lib";
import { ApiDefinition } from "aws-cdk-lib/aws-apigateway";
import { PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { CfnFunction } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Asset } from "aws-cdk-lib/aws-s3-assets";
import { Construct } from "constructs";
import { readdirSync } from "fs";
import { join } from "path";

function createLambda(stack: cdk.Stack, name: string) {
  const lambda = new NodejsFunction(stack, name, {
    runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
    entry: join(__dirname, "functions", `${name}.ts`),
  });

  (lambda.node.defaultChild as CfnFunction).overrideLogicalId(name);

  lambda.grantInvoke(new ServicePrincipal("apigateway.amazonaws.com"));
}

export class AppApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    readdirSync(join(__dirname, "functions")).forEach((file) => {
      createLambda(this, file.replace(".ts", ""));
    });

    const openApiAsset = new Asset(this, "openApiFile", {
      path: join(__dirname, "..", "..", "app-contract", "api.yaml"),
    });

    const transformMap = {
      Location: openApiAsset.s3ObjectUrl,
    };

    const data: cdk.IResolvable = cdk.Fn.transform(
      "AWS::Include",
      transformMap
    );

    const apiDefinition = ApiDefinition.fromInline(data);

    const apiRole = new Role(this, "apiRole", {
      assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
    });

    apiRole.addToPolicy(
      new PolicyStatement({
        resources: ["*"],
        actions: ["lambda:InvokeFunction"],
      })
    );

    new cdk.aws_apigateway.SpecRestApi(this, "hello-world", {
      apiDefinition,
    });
  }
}
