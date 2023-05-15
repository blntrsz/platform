#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import "source-map-support/register";
import { AppApiStack } from "@platform/app-api";
import { DeployPipelineStack, ToolsStack } from "@platform/app-tools";

const suffix = process.env.BRANCH ?? "";

const app = new cdk.App();

new ToolsStack(app, "tools");
new DeployPipelineStack(app, `pipeline-${suffix}`);
new AppApiStack(app, "api");
