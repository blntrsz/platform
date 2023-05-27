import { Handler } from "aws-lambda";
import { CloudFront, S3 } from "aws-sdk";

const s3 = new S3();
const cloudFront = new CloudFront();

export const handler: Handler = async () => {
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  const bucket = process.env.BUCKET ?? "";
  const { data } = (await s3.listObjectsV2({ Bucket: bucket }).promise())
    .$response;
  if (data) {
    const keys =
      data.Contents?.reduce((acc, content) => {
        if (content.Key) {
          acc.push(content.Key);
        }

        return acc;
      }, [] as string[]) ?? [];

    console.log("S3 objects keys: ", keys);

    for (const key of keys) {
      const object = await s3
        .getObject({
          Bucket: bucket,
          Key: key,
        })
        .promise()
        .catch((e) => {
          console.error("Could not get S3 item. Error: ", e);
        });

      if (!object) {
        return {
          statusCode: 500,
          body: JSON.stringify({
            message: "Object not found!",
          }),
        };
      }

      const newBody = Object.entries(process.env)
        .filter(([key]) => key.indexOf("VITE") > -1)
        .reduce((acc, [key, value]) => {
          acc =
            object?.Body?.toString().replaceAll(`{{ ${key} }}`, value ?? "") ??
            "";
          return acc;
        }, "");

      await s3
        .putObject({
          Bucket: bucket,
          Key: key,
          ContentType: object.ContentType,
          Body: newBody,
        })
        .promise()
        .catch((e) => {
          console.error("Could not upload S3 item. Error: ", e);
        });
    }
  }

  await cloudFront
    .createInvalidation({
      // eslint-disable-next-line turbo/no-undeclared-env-vars
      DistributionId: process.env.DISTRIBUTON_ID ?? "",
      InvalidationBatch: {
        Paths: {
          Quantity: 1,
          Items: ["/*"],
        },
        CallerReference: new Date().getTime().toString(),
      },
    })
    .promise()
    .catch((e) => {
      console.error(
        // eslint-disable-next-line turbo/no-undeclared-env-vars
        `Invalidation failed for distributon ${process.env.DISTRIBUTON_ID}. Error: ${e}`
      );
    });

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Ok!",
    }),
  };
};
