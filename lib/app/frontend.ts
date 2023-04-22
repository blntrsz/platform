import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import { join } from "path";

export class Frontend extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const oai = new cdk.aws_cloudfront.OriginAccessIdentity(
      this,
      "cloudfront-oai"
    );

    const bucket = new cdk.aws_s3.Bucket(this, "bucket", {
      bucketName: `platform-fullstack-${process.env.BRANCH}`.substring(0, 63),
      publicReadAccess: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: cdk.aws_s3.BlockPublicAccess.BLOCK_ALL,
    });

    bucket.addToResourcePolicy(
      new cdk.aws_iam.PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [bucket.arnForObjects("*")],
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
          origin: new cdk.aws_cloudfront_origins.S3Origin(bucket, {
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
        sources: [
          cdk.aws_s3_deployment.Source.asset(join(__dirname, "..", "dist")),
        ],
        destinationBucket: bucket,
        distribution,
        distributionPaths: ["/*"],
      }
    );

    new cdk.CfnOutput(this, "frontend-endpoint", {
      value: distribution.distributionDomainName,
    });
  }
}
