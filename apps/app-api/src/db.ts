import { Generated, Kysely, MysqlDialect } from "kysely";
import mysql from "mysql2";

interface UserTable {
  // made optional in inserts and updates.
  id: Generated<number>;
  name: string;
}

// Keys of this interface are table names.
export interface Database {
  user: UserTable;
}

const pool = mysql.createPool({
  password: process.env.DATABASE_PASSWORD,
  host: process.env.DATABASE_URL,
  user: process.env.DATABASE_USER,
  database: process.env.DATABASE_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 120_000, // idle connections timeout, in milliseconds, the default value 60000
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// You'd create one of these when you start your app.
export const db = new Kysely<Database>({
  // Use MysqlDialect for MySQL and SqliteDialect for SQLite.
  dialect: new MysqlDialect({
    pool,
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
