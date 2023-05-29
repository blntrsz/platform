/* eslint-disable @typescript-eslint/no-var-requires */
import { readdirSync } from "fs";
import { join } from "path";

import { Request, Response } from "express";
import OpenAPIBackend, {
  Context,
  Request as OpenApiRequest,
} from "openapi-backend";

interface CreateLocalApi {
  definitionPath: string;
  port: number;
  functionsDir: string;
}

export function createLocalApi({
  definitionPath,
  port = 9000,
  functionsDir,
}: CreateLocalApi) {
  // create api with your definition file or object
  const api = new OpenAPIBackend({
    definition: definitionPath,
  });

  const serverHandler =
    (h: (o: object) => { statusCode: number; body: string }) =>
    async (c: Context, req: Request, res: Response) => {
      const handlerResponse = await h({
        body: JSON.stringify(req.body),
        pathParameters: JSON.stringify(req.path),
      });
      return res
        .status(handlerResponse.statusCode)
        .json(JSON.parse(handlerResponse.body));
    };

  api.register({
    ...readdirSync(functionsDir).reduce((acc, file) => {
      acc[file.replace(".ts", "")] = serverHandler(
        require(join(functionsDir, file)).handler
      );

      return acc;
    }, {} as Record<string, (c: Context, req: Request, res: Response) => Promise<Response<never, Record<string, string>>>>),

    methodNotAllowed: async (c: Context, req: Request, res: Response) => {
      console.log(c);
      console.log(req);
      console.log(res);
      return res.status(405).json({ message: "Not Allowed" });
    },
  });

  // initialize the backend
  api.init();

  const express = require("express");
  const cors = require("cors");

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use((req: OpenApiRequest, res: Response) =>
    api.handleRequest(req, req, res)
  );
  app.listen(port, () => {
    console.log(`app is listening on ${port}`);
  });
}
