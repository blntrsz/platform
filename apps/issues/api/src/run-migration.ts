import { db } from "./db";

import { migrate } from "drizzle-orm/postgres-js/migrator";

migrate(db, { migrationsFolder: "./drizzle" });
