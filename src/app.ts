import express, { Application } from "express";
import routes from "./routes";
import bodyParser from "body-parser";
import "dotenv/config";
import errorMiddleware from "@middlewares/error.middleware";

const app: Application = express();

app.use(bodyParser.json());
app.use(routes);
app.use(errorMiddleware);

export default app;
