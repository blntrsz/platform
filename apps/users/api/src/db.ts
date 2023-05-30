import { createDb } from "@platform/db";
import { Generated } from "kysely";

interface UsersTable {
  // made optional in inserts and updates.
  id: Generated<number>;
  userName: string;
}

// Keys of this interface are table names.
export interface Database {
  users: UsersTable;
}

export const db = createDb<Database>({
  database: process.env.USERS_CLUSTER_NAME ?? "",
  secretArn: process.env.USERS_SECRET_ARN ?? "",
  resourceArn: process.env.USERS_CLUSTER_ARN ?? "",
});

export async function createUser(issue: Omit<UsersTable, "id">) {
  return await db.insertInto("users").values(issue).execute();
}

export async function getAllUsers() {
  return await db.selectFrom("users").selectAll().execute();
}
