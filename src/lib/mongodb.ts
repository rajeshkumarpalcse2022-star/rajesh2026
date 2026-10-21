import { MongoClient, type Collection, type Document } from "mongodb";

const DATABASE_NAME = "bijoya";
const COLLECTION_NAME = "greetings";

/**
 * Single typed greeting record. Older documents may pre-date the
 * personalisation fields, so the newer ones are optional.
 */
export interface GreetingDocument extends Document {
  sender: string;
  message: string;
  photos: string[];
  occasion?: string;
  isCustomized?: boolean;
  /** Server-issued write key; never returned by any endpoint. */
  ownerKey?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export const DEFAULT_OCCASION_VALUE = "bijoya-dashami";

const globalForMongo = globalThis as unknown as {
  mongoClientPromise?: Promise<MongoClient>;
};

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not configured.");
  }

  globalForMongo.mongoClientPromise ??= new MongoClient(uri).connect();

  return globalForMongo.mongoClientPromise;
}

export async function getGreetingsCollection(): Promise<
  Collection<GreetingDocument>
> {
  const client = await getClientPromise();
  return client.db(DATABASE_NAME).collection<GreetingDocument>(COLLECTION_NAME);
}
