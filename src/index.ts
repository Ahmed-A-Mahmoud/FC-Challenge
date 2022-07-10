import { dbConfig } from "@interfaces/db.interface";
import app from "app";
import config from "config";
import "dotenv/config";
import { Server } from "http";
import mongoose from "mongoose";
const serverPort = process.env.PORT || 5000;

const { host, port, name }: dbConfig = config.get("dbConfig");

const initializeConnections = () => {
  let server: Server;
  try {
    mongoose.connect(`mongodb://${host}:${port}/${name}`);

    // 'connected' event fires on initial connection and reconnection to MongoDB
    mongoose.connection.on("connected", () => {
      console.log(`Connected to MongoDB on port ${port}`);
      server = app.listen(serverPort, () => console.log(`Server listening on port ${serverPort}`));
    });

    // 'disconnected' event firs on disconnection from MongoDB
    mongoose.connection.on("disconnected", () => {
      console.log("Disconnected from MongoDB");
      server.close();
    });
  } catch (error) {
    console.log(error);
  }
};

initializeConnections();
