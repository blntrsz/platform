import { createIssue } from "../db";

import { operations } from "@platform/issues-contract";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";

type Body =
  operations["postIssues"]["requestBody"]["content"]["application/json"];
type Response =
  operations["postIssues"]["responses"]["200"]["content"]["application/json"];

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  console.log("event 👉", event);
  const body = JSON.parse(event.body ?? "") as Body;

  await createIssue(body);

  return {
    body: JSON.stringify({
      status: "ok",
    } satisfies Response),
    headers: {
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
    },
    statusCode: 200,
  };
}
