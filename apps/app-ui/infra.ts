import { join } from "path";

import { StaticSite } from "@platform/cdk";
import { Construct } from "constructs";

export function createFrontendInfra(
  scope: Construct,
  id: string,
  apiUrl: string,
  region: string,
  account: string
) {
  return new StaticSite(scope, id, {
    path: __dirname,
    buildCommand: "pnpm build",
    distDir: join(__dirname, "dist"),
    stage: process.env.STAGE ?? "",
    environment: {
      VITE_API_URL: apiUrl,
    },
    account,
    region,
  });
}
