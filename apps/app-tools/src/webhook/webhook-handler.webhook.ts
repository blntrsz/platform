import { Handler } from "aws-lambda";
import { CodeBuild } from "aws-sdk";
import { z } from "zod";

const bodyParser = z
  .object({
    ref: z.string(),
    ref_type: z.enum(["branch"]),
  })
  .transform(({ ref }) => ({ branch: ref }));

const headersParser = z
  .object({
    ["X-GitHub-Event"]: z.enum(["delete", "create"]),
  })
  .transform(({ "X-GitHub-Event": event }) => ({ action: event }));

export const handler: Handler = async (event) => {
  console.log(event);

  const { branch } = bodyParser.parse(JSON.parse(event.body));
  const { action } = headersParser.parse(event.headers);
  event.headers;

  const codebuild = new CodeBuild();
  await codebuild
    .startBuild({
      projectName:
        (action === "create"
          ? process.env.CREATOR_PROJECT_NAME
          : process.env.DESTROYER_PROJECT_NAME) ?? "",
      environmentVariablesOverride: [
        {
          name: "BRANCH",
          value: branch,
        },
      ],
    })
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "ok",
    }),
  };
};
