import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "chefpax";

let client: MongoClient;
let db: Db;

declare global {
  // allow global var in dev hot-reload
  var _mongo: { client: MongoClient; db: Db } | undefined;
}

export async function getDb(): Promise<Db> {
  // If no MongoDB URI is provided, throw a clear error
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set. Please add it to your .env.local file.");
  }

  if (global._mongo) return global._mongo.db;
  if (!client) client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  global._mongo = { client, db };
  return db;
}
