#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AppStack } from "../lib/app-stack";
import { ToolsStack } from "../lib/tools-stack";
import { DeployPipelineStack } from "../lib/deploy-pipeline-stack";

const suffix = process.env.BRANCH ?? "";

const app = new cdk.App();

new ToolsStack(app, "tools");
new DeployPipelineStack(app, `pipeline-${suffix}`);
new AppStack(app, `app-${suffix}`);
