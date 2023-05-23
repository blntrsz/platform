import { createUser } from "../db";

import { operations } from "@platform/app-contract";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";

type Body =
  operations["postUsers"]["requestBody"]["content"]["application/json"];
type Response =
  operations["postUsers"]["responses"]["200"]["content"]["application/json"];

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  console.log("event 👉", event);
  const body = JSON.parse(event.body ?? "") as Body;
  await createUser(body.name);

  return {
    body: JSON.stringify({
      name: body.name,
    } satisfies Response),
    headers: {
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
    },
    statusCode: 200,
  };
}
