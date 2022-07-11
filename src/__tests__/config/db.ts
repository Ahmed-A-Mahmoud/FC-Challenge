import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongo: MongoMemoryServer;

// connect to db
const connect = async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);
};

// clear the db, remove all data
const clearDatabase = async () => {
  const models = mongoose.connection.models;
  for (const key in models) {
    const model = models[key];
    await model.deleteMany();
  }
};

// disconnect and close connection
const closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongo.stop();
};

export default {
  connect,
  clearDatabase,
  closeDatabase,
};
