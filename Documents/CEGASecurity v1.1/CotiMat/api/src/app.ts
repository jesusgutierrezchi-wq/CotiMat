import fs from "node:fs";
import path from "node:path";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import YAML from "yaml";
import { env } from "./config/env";
import { errorMiddleware } from "./middlewares/error.middleware";
import { notFoundMiddleware } from "./middlewares/notFound.middleware";
import { serializeDecimalsMiddleware } from "./middlewares/serializeDecimals.middleware";
import { apiRouter } from "./routes";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGINS.length > 0 ? env.CORS_ORIGINS : true,
  })
);
app.use(express.json());
app.use(serializeDecimalsMiddleware);

// Imágenes de materiales servidas como estático desde el volumen local (ver StorageService).
app.use("/uploads", express.static(path.resolve(process.cwd(), env.UPLOADS_DIR)));

const openapiPath = path.resolve(process.cwd(), "openapi.yaml");
if (fs.existsSync(openapiPath)) {
  const openapiDocument = YAML.parse(fs.readFileSync(openapiPath, "utf-8"));
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiDocument));
}

app.use("/api", apiRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
