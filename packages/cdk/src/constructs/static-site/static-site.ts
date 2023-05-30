import { execSync } from "child_process";

import { getBuildCmdEnvironment } from "../../utils/get-build-cmd-environment";

import * as cdk from "aws-cdk-lib";
import { DockerImage } from "aws-cdk-lib";
import {
  Function as CfFunction,
  FunctionCode as CfFunctionCode,
  FunctionEventType as CfFunctionEventType,
} from "aws-cdk-lib/aws-cloudfront";
import * as iam from "aws-cdk-lib/aws-iam";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Source } from "aws-cdk-lib/aws-s3-deployment";
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  PhysicalResourceId,
} from "aws-cdk-lib/custom-resources";
import { Construct } from "constructs";
import { copySync } from "fs-extra";

interface StaticSiteProps {
  app: string;
  stage: string;
  path: string;
  buildCommand: string;
  distDir: string;
  environment?: Record<string, string>;
  region: string;
  account: string;
}

export class StaticSite extends Construct {
  bucket: cdk.aws_s3.Bucket;
  constructor(scope: Construct, id: string, props: StaticSiteProps) {
    super(scope, id);

    const bundle = Source.asset(props.path, {
      bundling: {
        image: DockerImage.fromRegistry("alpine"),
        local: {
          tryBundle(outputDir: string) {
            try {
              execSync(props.buildCommand, {
                cwd: props.path,
                stdio: "inherit",
                env: {
                  ...process.env,
                  ...(props.environment
                    ? getBuildCmdEnvironment(props.environment)
                    : {}),
                },
              });
              copySync(props.distDir, outputDir, {
                overwrite: true,
              });
              return true;
            } catch (e) {
              console.error(e);
              return false;
            }
          },
        },
      },
    });

    const oai = new cdk.aws_cloudfront.OriginAccessIdentity(
      this,
      "cloudfront-oai"
    );

    this.bucket = new cdk.aws_s3.Bucket(this, "bucket", {
      bucketName: `platform-${props.app}-${props.stage}`
        .substring(0, 63)
        .toLocaleLowerCase(),
      publicReadAccess: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: cdk.aws_s3.BlockPublicAccess.BLOCK_ALL,
    });

    this.bucket.addToResourcePolicy(
      new cdk.aws_iam.PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [this.bucket.arnForObjects("*")],
        principals: [
          new cdk.aws_iam.CanonicalUserPrincipal(
            oai.cloudFrontOriginAccessIdentityS3CanonicalUserId
          ),
        ],
      })
    );

    // spa configuration so refreshing non-root path will not get as 404
    const errorResponse: cdk.aws_cloudfront.ErrorResponse = {
      httpStatus: 403,
      responseHttpStatus: 200,
      responsePagePath: "/index.html",
    };

    const distribution = new cdk.aws_cloudfront.Distribution(
      this,
      "distribution",
      {
        defaultRootObject: "index.html",
        errorResponses: [errorResponse],
        defaultBehavior: {
          origin: new cdk.aws_cloudfront_origins.S3Origin(this.bucket, {
            originAccessIdentity: oai,
          }),
          allowedMethods:
            cdk.aws_cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,

          functionAssociations: [
            {
              function: new CfFunction(this, "CloudFrontFunction", {
                code: CfFunctionCode.fromInline(`
function handler(event) {
  var response  = event.response;
  var headers  = response.headers;

  headers['access-control-allow-headers'] = {value: "*"};
  headers['access-control-allow-origin'] = {value: "*"};
  headers['access-control-allow-methods'] = {value: "*"};

  return response;
}
          `),
              }),
              eventType: CfFunctionEventType.VIEWER_RESPONSE,
            },
          ],
        },
      }
    );

    // Deploy site contents to S3 bucket
    const s3Deployment = new cdk.aws_s3_deployment.BucketDeployment(
      this,
      "deploy-with-invalidation",
      {
        sources: [bundle],
        destinationBucket: this.bucket,
      }
    );

    if (props.environment) {
      const envReplacerFunction = new NodejsFunction(this, "env-replacer", {
        runtime: Runtime.NODEJS_18_X,
        environment: {
          ...props.environment,
          BUCKET: this.bucket.bucketName,
          DISTRIBUTON_ID: distribution.distributionId,
        },
        initialPolicy: [
          // TODO: stricter policy -> get S3, upload S3, invalidate distributon
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ["*"],
            resources: ["*"],
          }),
        ],
      });

      const lifecycleHandler = {
        service: "Lambda",
        action: "invoke",
        parameters: {
          FunctionName: envReplacerFunction.functionName,
          InvocationType: "Event",
        },
        physicalResourceId: PhysicalResourceId.of(
          new Date().getTime().toString()
        ),
      };

      //Run lambda on Create and on Update
      const s3HandlerAwsCustomResource = new AwsCustomResource(
        this,
        "s3-handler-trigger",
        {
          policy: AwsCustomResourcePolicy.fromStatements([
            new iam.PolicyStatement({
              actions: ["lambda:InvokeFunction"],
              effect: iam.Effect.ALLOW,
              resources: [envReplacerFunction.functionArn],
            }),
          ]),
          timeout: cdk.Duration.minutes(15),
          onCreate: lifecycleHandler,
          onUpdate: lifecycleHandler,
        }
      );

      s3HandlerAwsCustomResource.node.addDependency(s3Deployment, distribution);
    }

    new cdk.CfnOutput(this, "frontend-endpoint", {
      exportName: `frontendUrl-${props.app}-${props.stage}`,
      value: distribution.distributionDomainName,
    });
  }
}
