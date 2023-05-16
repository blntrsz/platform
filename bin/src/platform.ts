#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import "source-map-support/register";
import { AppStack, DeployPipelineStack, ToolsStack } from "@platform/app-tools";

const suffix = process.env.BRANCH ?? "";

const app = new cdk.App();

new ToolsStack(app, "tools", {
  env: {
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    account: process.env.CDK_DEFAULT_ACCOUNT,
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    region: process.env.CDK_DEFAULT_REGION,
  },
});
new DeployPipelineStack(app, `pipeline-${suffix}`, {
  env: {
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    account: process.env.CDK_DEFAULT_ACCOUNT,
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    region: process.env.CDK_DEFAULT_REGION,
  },
});
new AppStack(app, `app-${suffix}`, {
  env: {
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    account: process.env.CDK_DEFAULT_ACCOUNT,
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    region: process.env.CDK_DEFAULT_REGION,
  },
});
