import { dbConfig } from "@interfaces/db.interface";
import app from "app";
import config from "config";
import "dotenv/config";
import mongoose from "mongoose";
const serverPort = process.env.PORT;

const { host, port, name }: dbConfig = config.get("dbConfig");
mongoose
  .connect(`mongodb://${host}:${port}/${name}`)
  .then(() => {
    app.listen(serverPort, () => console.log(`Running on port ${serverPort}`));
  })
  .catch((err) => {
    console.log(err);
  });
