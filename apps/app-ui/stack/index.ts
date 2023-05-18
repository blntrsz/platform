import { ExecSyncOptions, execSync } from "child_process";
import { join } from "path";

import * as cdk from "aws-cdk-lib";
import { DockerImage } from "aws-cdk-lib";
import { Source } from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";
import { copySync } from "fs-extra";

export class Frontend extends Construct {
  bucket: cdk.aws_s3.Bucket;
  constructor(
    scope: Construct,
    id: string,
    { stage }: { stage: string },
    config: object
  ) {
    super(scope, id);

    const execOptions: ExecSyncOptions = {
      stdio: ["ignore", process.stderr, "inherit"],
    };

    const bundle = Source.asset(join(__dirname, "..", "..", "app-ui"), {
      bundling: {
        command: [
          "sh",
          "-c",
          'echo "Docker build not supported. Please install esbuild."',
        ],
        image: DockerImage.fromRegistry("alpine"),
        local: {
          tryBundle(outputDir: string) {
            try {
              execSync("esbuild --version", execOptions);
            } catch {
              return false;
            }
            execSync("pnpm build", execOptions);
            copySync(join(__dirname, "..", "dist"), outputDir, {
              overwrite: true,
            });
            return true;
          },
        },
      },
    });

    const oai = new cdk.aws_cloudfront.OriginAccessIdentity(
      this,
      "cloudfront-oai"
    );

    this.bucket = new cdk.aws_s3.Bucket(this, "bucket", {
      bucketName: `platform-fullstack-${stage}`
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
        sources: [
          bundle,
          cdk.aws_s3_deployment.Source.jsonData("config.json", config),
        ],
        destinationBucket: this.bucket,
        distribution,
        distributionPaths: ["/*"],
      }
    );

    new cdk.CfnOutput(this, "frontend-endpoint", {
      exportName: `frontendUrl-${stage}`,
      value: distribution.distributionDomainName,
    });
  }
}
