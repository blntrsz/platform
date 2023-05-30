import { issuesTable } from "./db/schema";

import { RDSDataClient } from "@aws-sdk/client-rds-data";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/aws-data-api/pg";

const rdsClient = new RDSDataClient({});

export const db = drizzle(rdsClient, {
  database: process.env.ISSUES_CLUSTER_NAME ?? "",
  secretArn: process.env.ISSUES_SECRET_ARN ?? "",
  resourceArn: process.env.ISSUES_CLUSTER_ARN ?? "",
});

export async function createIssue({
  title,
  userId,
  userName,
}: {
  title: string;
  userId: number;
  userName: string;
}) {
  return await db.insert(issuesTable).values({
    title,
    userId,
    userName,
  });
}

export async function getIssues() {
  return await db.select().from(issuesTable);
}

export async function getIssuesForUserId(userId: number) {
  return await db
    .select()
    .from(issuesTable)
    .where(eq(issuesTable.userId, userId));
}
