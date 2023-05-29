import { getIssuesForUserId } from "../db";

import { operations } from "@platform/issues-contract";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";

type Response =
  operations["getIssuesForUserId"]["responses"]["200"]["content"]["application/json"];
type PathParameteres = operations["getIssuesForUserId"]["parameters"]["path"];

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  console.log("event 👉", event);
  const { userId } = event.pathParameters as unknown as PathParameteres;

  return {
    body: JSON.stringify((await getIssuesForUserId(userId)) satisfies Response),
    headers: {
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
    },
    statusCode: 200,
  };
}
