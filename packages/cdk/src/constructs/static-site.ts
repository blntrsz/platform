import { execSync } from "child_process";

import { getBuildCmdEnvironment } from "../utils/get-build-cmd-environment";

import * as cdk from "aws-cdk-lib";
import { DockerImage } from "aws-cdk-lib";
import { Source } from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";
import { copySync } from "fs-extra";

interface StaticSiteProps {
  stage: string;
  path: string;
  buildCommand: string;
  distDir: string;
  environment?: Record<string, string>;
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
                  ...getBuildCmdEnvironment(props.environment),
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
      bucketName: `platform-fullstack-${props.stage}`
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
        },
      }
    );

    // Deploy site contents to S3 bucket
    new cdk.aws_s3_deployment.BucketDeployment(
      this,
      "deploy-with-invalidation",
      {
        sources: [bundle],
        destinationBucket: this.bucket,
        distribution,
        distributionPaths: ["/*"],
      }
    );

    new cdk.CfnOutput(this, "frontend-endpoint", {
      exportName: `frontendUrl-${props.stage}`,
      value: distribution.distributionDomainName,
    });
  }
}
