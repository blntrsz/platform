import * as cdk from "aws-cdk-lib";
import * as pipelines from "aws-cdk-lib/pipelines";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { BuildSpec, LinuxBuildImage } from "aws-cdk-lib/aws-codebuild";

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new Pipeline(this, "pipeline");
  }
}

class Pipeline extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // TODO: more strict policy
    const policy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["*"],
      resources: ["*"],
    });

    const codebuildStep = new pipelines.CodeBuildStep("SynthStep", {
      rolePolicyStatements: [policy],
      input: pipelines.CodePipelineSource.connection(
        "blntrsz/platform",
        process.env.BRANCH ?? "",
        {
          codeBuildCloneOutput: true,
          connectionArn:
            "arn:aws:codestar-connections:eu-central-1:155601209279:connection/51dc3226-ffdd-459d-a034-50f9ff503d2b",
        }
      ),
      env: {
        BRANCH: process.env.BRANCH ?? "",
      },
      buildEnvironment: {
        buildImage: LinuxBuildImage.AMAZON_LINUX_2_4,
      },
      installCommands: ["npm install -g aws-cdk pnpm@7.30.3"],
      commands: [
        "pnpm i",
        "pnpm cdk deploy app-$BRANCH --require-approval never",
      ],
    });

    new pipelines.CodePipeline(this, "pipeline", {
      pipelineName: "pipeline",
      synthCodeBuildDefaults: {
        partialBuildSpec: BuildSpec.fromObject({
          phases: {
            install: {
              "runtime-versions": {
                nodejs: "16",
              },
            },
          },
        }),
      },
      codeBuildDefaults: {
        buildEnvironment: {
          buildImage: LinuxBuildImage.AMAZON_LINUX_2_4,
        },
      },
      synth: codebuildStep,
    });
  }
}
