import { MongoClient } from 'mongodb';

// Connection URI
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

// Cache the MongoDB connection to reuse it across requests
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  // If we have a cached connection, return it
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // Create a new MongoDB client
  const client = new MongoClient(uri);

  // Connect to the MongoDB server
  await client.connect();
  
  // Get the database
  const db = client.db(dbName);

  // Cache the client and db for reuse
  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

// Helper function to get the audit logs collection
export async function getAuditCollection() {
  const { db } = await connectToDatabase();
  return db.collection('audit_logs');
}

export default connectToDatabase;