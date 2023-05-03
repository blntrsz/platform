#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AppStack, ToolsStack, DeployPipelineStack } from "@platform/app-tools";

const suffix = process.env.BRANCH ?? "";

const app = new cdk.App();

new ToolsStack(app, "tools");
new DeployPipelineStack(app, `pipeline-${suffix}`);
new AppStack(app, `app-${suffix}`);
