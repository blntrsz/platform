import { getAllUsers } from "../db";

import { operations } from "@platform/issues-contract";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";

type Response =
  operations["getUsers"]["responses"]["200"]["content"]["application/json"];

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  console.log("event 👉", event);

  return {
    body: JSON.stringify((await getAllUsers()) satisfies Response),
    headers: {
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
    },
    statusCode: 200,
  };
}
