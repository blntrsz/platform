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

const stage = process.env.STAGE;

const app = new cdk.App();

const props = {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
};

new HostToolsStack(app, "host-tools");
new HostDeployPipelineStack(app, `host-pipeline-${stage}`, props);
new HostAppStack(app, `host-${stage}`, props);

new IssuesToolsStack(app, "issues-tools");
new IssuesDeployPipelineStack(app, `issues-pipeline-${stage}`, props);
new IssuesAppStack(app, `issues-app-${stage}`, props);

new UsersToolsStack(app, "users-tools");
new UsersDeployPipelineStack(app, `users-pipeline-${stage}`, props);
new UsersAppStack(app, `users-app-${stage}`, props);
