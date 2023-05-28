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
      apiUrl?: string;
      account: string;
      region: string;
    }
  ) {
    super(scope, id, {
      app: "host",
      path: __dirname,
      buildCommand: "pnpm build",
      distDir: join(__dirname, "dist"),
      stage: process.env.STAGE ?? "",
      environment: {
        VITE_API_URL: apiUrl ?? "",
      },
      account,
      region,
    });
  }
}
