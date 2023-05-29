import { promises as fs } from "fs";
import * as path from "path";

import { RDSData } from "@aws-sdk/client-rds-data";
import { FileMigrationProvider, Kysely, Migrator } from "kysely";
import { DataApiDialect } from "kysely-data-api";

export function createDb<T>(props: {
  database: string;
  secretArn: string;
  resourceArn: string;
}) {
  return new Kysely<T>({
    dialect: new DataApiDialect({
      mode: "postgres",
      driver: {
        ...props,
        client: new RDSData({}),
      },
    }),
  });
}

export async function migrateToLatest<T>(
  db: Kysely<T>,
  migrationFolder: string
) {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      // This needs to be an absolute path.
      migrationFolder,
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === "Success") {
      console.log(`migration "${it.migrationName}" was executed successfully`);
    } else if (it.status === "Error") {
      console.error(`failed to execute migration "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error("failed to migrate");
    console.error(error);
    process.exit(1);
  }

  await db.destroy();
}
