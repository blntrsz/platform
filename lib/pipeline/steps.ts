import { BuildSpec } from "aws-cdk-lib/aws-codebuild";

export function createUnitTestSpec() {
  return BuildSpec.fromObject({
    version: "0.2",
    phases: {
      install: {
        "runtime-versions": {
          nodejs: "16",
        },
        commands: ["npm install -g aws-cdk pnpm@7.30.3", "pnpm i"],
      },
      build: {
        commands: ["pnpm test"],
      },
    },
  });
}

export function createBuildSpec() {
  return BuildSpec.fromObject({
    version: "0.2",
    phases: {
      install: {
        "runtime-versions": {
          nodejs: "16",
        },
        commands: ["npm install -g aws-cdk pnpm@7.30.3", "pnpm i"],
      },
      build: {
        commands: ["pnpm cdk deploy app-$BRANCH --require-approval never"],
      },
    },
  });
}
