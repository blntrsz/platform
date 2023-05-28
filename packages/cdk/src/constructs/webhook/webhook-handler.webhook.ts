import { Handler } from "aws-lambda";
import { CodeBuild, CodePipeline } from "aws-sdk";
import { z } from "zod";

const branchEvent = z
  .object({
    ref: z.string(),
    ref_type: z.enum(["branch"]),
  })
  .transform(({ ref }) => ({ branch: ref, commits: [] }));

const pushEvent = z
  .object({
    ref: z.string(),
    commits: z.array(
      z.object({
        added: z.array(z.string()),
        removed: z.array(z.string()),
        modified: z.array(z.string()),
      })
    ),
  })
  .transform(({ commits, ref }) => ({
    commits,
    branch: ref.replace("refs/heads/", ""),
  }));

const headersParser = z
  .object({
    ["X-GitHub-Event"]: z.enum(["delete"]),
  })
  .transform(({ "X-GitHub-Event": event }) => ({ action: event }));

const codebuild = new CodeBuild();
const codepipeline = new CodePipeline();

export const handler: Handler = async (event) => {
  console.log(event);

  const parsedBranchBody = branchEvent.safeParse(JSON.parse(event.body));
  const parsedHeader = headersParser.safeParse(event.headers);

  if (parsedBranchBody.success && parsedHeader.success) {
    await codebuild
      .startBuild({
        projectName: process.env.DESTROYER_PROJECT_NAME ?? "",
        environmentVariablesOverride: [
          {
            name: "STAGE",
            value: parsedBranchBody.data.branch,
          },
        ],
      })
      .promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Deletion of pipeline-${parsedBranchBody.data.branch} has been started.`,
      }),
    };
  }

  const parsedPushBody = pushEvent.safeParse(JSON.parse(event.body));

  if (parsedPushBody.success) {
    function testIsAppChanged(toTest: string) {
      // eslint-disable-next-line turbo/no-undeclared-env-vars
      return new RegExp(`^apps\/${process.env.APP}`).test(toTest);
    }

    if (
      parsedPushBody.data.commits.some((commit) =>
        [
          () => commit.added.some(testIsAppChanged),
          () => commit.removed.some(testIsAppChanged),
          () => commit.modified.some(testIsAppChanged),
        ].some((fn) => fn())
      )
    ) {
      try {
        await codepipeline
          .startPipelineExecution({
            name: `pipeline-${parsedPushBody.data.branch}`,
          })
          .promise();

        return {
          statusCode: 200,
          body: JSON.stringify({
            message: `Pipeline: pipeline-${parsedPushBody.data.branch} has been started`,
          }),
        };
      } catch (e) {
        await codebuild
          .startBuild({
            projectName: process.env.CREATOR_PROJECT_NAME ?? "",
            environmentVariablesOverride: [
              {
                name: "STAGE",
                value: parsedPushBody.data.branch,
              },
            ],
          })
          .promise();

        return {
          statusCode: 200,
          body: JSON.stringify({
            message: `Pipeline creation with STAGE=${parsedPushBody.data.branch} has been started`,
          }),
        };
      }
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "No event is processed.",
    }),
  };
};
