import { createDb } from "@platform/db";
import { Generated } from "kysely";

interface UserTable {
  // made optional in inserts and updates.
  id: Generated<number>;
  name: string;
}

// Keys of this interface are table names.
export interface Database {
  user: UserTable;
}

export const db = createDb<Database>({
  database: process.env.ISSUES_CLUSTER_NAME ?? "",
  secretArn: process.env.ISSUES_SECRET_ARN ?? "",
  resourceArn: process.env.ISSUES_CLUSTER_ARN ?? "",
});

export async function createUser(name: string) {
  return await db
    .insertInto("user")
    .values({
      name,
    })
    .execute();
}

export async function getUsers() {
  return await db.selectFrom("user").select("name").execute();
}
