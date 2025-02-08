import 'dotenv/config';
import { drizzle } from "drizzle-orm/neon-http";
import config from "@/lib/config";
import { neon } from "@neondatabase/serverless";

const sql = neon(config.databaseUrl);

export const db=drizzle({client:sql,casing:"snake_case"})