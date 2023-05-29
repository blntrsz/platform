import path from "path";

import { db } from "./db";

import { migrateToLatest } from "@platform/db";

migrateToLatest(db, path.join(__dirname, "migrations"));
