// backend/src/db.js
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { ENV } from "./env.js"; // This likely refers to backend/src/env.js
import * as schema from "../db/schema.js" // This refers to backend/src/db/schema.js

const sql = neon(ENV.DATABASE_URL)
export const db = drizzle(sql, { schema });