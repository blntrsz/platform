#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AppStack } from "../lib/app";
import { ToolsStack } from "../lib/tools-stack";

const suffix = process.env.BRANCH ?? "prod";

const app = new cdk.App();
new ToolsStack(app, "tools");
new AppStack(app, `app-${suffix}`);
