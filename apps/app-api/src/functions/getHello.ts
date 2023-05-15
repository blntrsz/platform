import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";

import { operations } from "@platform/app-contract";

type Response =
  operations["getHello"]["responses"]["200"]["content"]["application/json"];

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  console.log("event 👉", event);

  return {
    body: JSON.stringify({
      greeting: "Hello Traveler!",
    } satisfies Response),
    headers: {
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
    },
    statusCode: 200,
  };
}
