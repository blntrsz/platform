import * as cdk from "aws-cdk-lib";
import * as pipelines from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new Pipeline(this, "pipeline");
  }
}

class Pipeline extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new pipelines.CodePipeline(this, "Pipeline", {
      pipelineName: "pipeline",
      synth: new pipelines.CodeBuildStep("SynthStep", {
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
        installCommands: ["npm install -g aws-cdk pnpm@7.30.3"],
        commands: [
          "pnpm i",
          "pnpm cdk deploy app-$BRANCH --require-approval never",
        ],
      }),
    });
  }
}
