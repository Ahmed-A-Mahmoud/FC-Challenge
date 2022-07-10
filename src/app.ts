import express, { Application } from "express";
import routes from "./routes";
import errorMiddleware from "@middlewares/error.middleware";
import "dotenv/config";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json";

const app: Application = express();

app.use("/docs/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));
app.use(express.json());
app.use(routes);
app.use(errorMiddleware);

export default app;
