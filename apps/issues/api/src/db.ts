import { RDSData } from "@aws-sdk/client-rds-data";
import { Generated, Kysely } from "kysely";
import { DataApiDialect } from "kysely-data-api";

interface IssuesTable {
  // made optional in inserts and updates.
  id: Generated<number>;
  title: string;
  userId: number;
  userName: string;
}

// Keys of this interface are table names.
export interface Database {
  issues: IssuesTable;
}

export const db = new Kysely<Database>({
  dialect: new DataApiDialect({
    mode: "postgres",
    driver: {
      database: process.env.ISSUES_CLUSTER_NAME ?? "",
      secretArn: process.env.ISSUES_SECRET_ARN ?? "",
      resourceArn: process.env.ISSUES_CLUSTER_ARN ?? "",
      client: new RDSData({}),
    },
  }),
});

export async function createIssue(issue: Omit<IssuesTable, "id">) {
  return await db.insertInto("issues").values(issue).execute();
}

export async function getIssues() {
  return await db.selectFrom("issues").selectAll().execute();
}

export async function getIssuesForUserId(userId: number) {
  return await db
    .selectFrom("issues")
    .selectAll()
    .where("issues.userId", "=", userId)
    .execute();
}
