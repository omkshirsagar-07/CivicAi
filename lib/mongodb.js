import mongoose from 'mongoose';

/**
 * Cached MongoDB connection (module-level global).
 * Next.js dev mode hot-reloads modules, so the connection is cached on
 * `globalThis` to avoid exhausting Atlas connection pools in development.
 */
const MONGO_URI = process.env.MONGODB_URI;
const MONGO_DB = process.env.MONGODB_DB || 'civicai';

if (!MONGO_URI) {
  console.warn(
    '[civicai] MONGODB_URI is not set. Database features are disabled (demo mode).'
  );
}

const cached = globalThis._mongoose || { conn: null, promise: null };

async function connectToDatabase() {
  if (cached.conn) return cached.conn;
  if (!MONGO_URI) return null;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGO_URI, {
        dbName: MONGO_DB,
        serverSelectionTimeoutMS: 8000,
        maxPoolSize: 10,
      })
      .then((m) => m)
      .catch((err) => {
        cached.promise = null;
        console.error('[civicai] MongoDB connection failed:', err.message);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  globalThis._mongoose = cached;
  return cached.conn;
}

/** Human-friendly status describing database availability. */
async function getDbStatus() {
  if (!process.env.MONGODB_URI) {
    return { available: false, reason: 'MONGODB_URI not configured' };
  }
  try {
    await connectToDatabase();
    const ready = mongoose.connection?.readyState === 1;
    return ready
      ? { available: true }
      : { available: false, reason: 'connection not ready' };
  } catch (err) {
    return { available: false, reason: err.message };
  }
}

export { connectToDatabase, getDbStatus };
export default connectToDatabase;
