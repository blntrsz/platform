/* eslint-disable  @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types */

import { readdirSync } from "fs";
import { join } from "path";

import { Response } from "express";
import OpenAPIBackend, { Request } from "openapi-backend";

// create api with your definition file or object
const api = new OpenAPIBackend({
  definition: "node_modules/@platform/app-contract/api.yaml",
});

const serverHandler: any =
  (h: Function) => async (c: any, req: any, res: any) => {
    const handlerResponse = await h({
      body: JSON.stringify(req.body),
    } as any);
    return res
      .status(handlerResponse.statusCode)
      .json(JSON.parse(handlerResponse.body));
  };

// register your framework specific request handlers here
api.register({
  ...readdirSync(join(__dirname, "functions")).reduce((acc, file) => {
    acc[file.replace(".ts", "")] = serverHandler(
      require(`./functions/${file}`).handler
    );

    return acc;
  }, {} as Record<string, Function>),

  methodNotAllowed: async (c: any, req: any, res: any) => {
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
app.use((req: Request, res: Response) => api.handleRequest(req, req, res));
app.listen(9000, () => {
  console.log("app is listening on 9000");
});
