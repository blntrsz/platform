import { RDSData } from "@aws-sdk/client-rds-data";
import { Generated, Kysely } from "kysely";
import { DataApiDialect } from "kysely-data-api";

interface UserTable {
  // made optional in inserts and updates.
  id: Generated<number>;
  name: string;
}

// Keys of this interface are table names.
export interface Database {
  user: UserTable;
}

export const db = new Kysely<Database>({
  dialect: new DataApiDialect({
    mode: "postgres",
    driver: {
      database: process.env.CLUSTER_NAME ?? "",
      secretArn: process.env.SECRET_ARN ?? "",
      resourceArn: process.env.CLUSTER_ARN ?? "",
      client: new RDSData({}),
    },
  }),
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
