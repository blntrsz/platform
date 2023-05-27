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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      data.Contents?.reduce((acc, content) => {
        if (content.Key) {
          acc.push(content.Key);
        }

        return acc;
      }, [] as string[]) ?? [];

    for (const key of keys) {
      const { Body, Metadata, ContentType } = await s3
        .getObject({
          Bucket: bucket,
          Key: key,
        })
        .promise();

      const newBody = Object.entries(process.env)
        .filter(([key]) => key.indexOf("VITE") > -1)
        .reduce((acc, [key, value]) => {
          acc = Body?.toString().replaceAll(`{{ ${key} }}`, value ?? "") ?? "";
          return acc;
        }, "");

      await s3
        .upload({
          Bucket: bucket,
          Key: key,
          Body: newBody,
          Metadata,
          ContentType,
        })
        .promise();
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
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Ok!",
    }),
  };
};
