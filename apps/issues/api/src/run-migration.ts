import { db } from "./db";

import { migrate } from "drizzle-orm/aws-data-api/pg/migrator";

migrate(db, { migrationsFolder: "./drizzle" });
