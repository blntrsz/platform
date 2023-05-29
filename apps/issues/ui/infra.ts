import { join } from "path";

import { StaticSite } from "@platform/cdk";
import { Construct } from "constructs";

export class Frontend extends StaticSite {
  constructor(
    scope: Construct,
    id: string,
    {
      apiUrl,
      account,
      region,
    }: {
      apiUrl: string;
      account: string;
      region: string;
    }
  ) {
    super(scope, id, {
      app: "issues",
      path: __dirname,
      buildCommand: "pnpm build",
      distDir: join(__dirname, "dist"),
      // eslint-disable-next-line turbo/no-undeclared-env-vars
      stage: process.env.STAGE ?? "",
      environment: {
        VITE_ISSUES_API_URL: apiUrl,
      },
      account,
      region,
    });
  }
}
