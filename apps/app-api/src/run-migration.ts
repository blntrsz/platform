import { db } from "./db";

import { migrateToLatest } from "@platform/db";

migrateToLatest(db);
