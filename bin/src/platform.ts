#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import "source-map-support/register";
import {
  HostAppStack,
  HostDeployPipelineStack,
  HostToolsStack,
} from "@platform/host-stacks";
import {
  IssuesAppStack,
  IssuesDeployPipelineStack,
  IssuesToolsStack,
} from "@platform/issues-stacks";
import {
  UsersAppStack,
  UsersDeployPipelineStack,
  UsersToolsStack,
} from "@platform/users-stacks";

// eslint-disable-next-line turbo/no-undeclared-env-vars
const stage = process.env.STAGE;

const app = new cdk.App();

const props = {
  env: {
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    account: process.env.CDK_DEFAULT_ACCOUNT,
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    region: process.env.CDK_DEFAULT_REGION,
  },
};

new HostToolsStack(app, "host-tools");
new HostDeployPipelineStack(app, `host-pipeline-${stage}`, props);
new HostAppStack(app, `host-app-${stage}`, props);

new IssuesToolsStack(app, "issues-tools");
new IssuesDeployPipelineStack(app, `issues-pipeline-${stage}`, props);
new IssuesAppStack(app, `issues-app-${stage}`, props);

new UsersToolsStack(app, "users-tools");
new UsersDeployPipelineStack(app, `users-pipeline-${stage}`, props);
new UsersAppStack(app, `users-app-${stage}`, props);
