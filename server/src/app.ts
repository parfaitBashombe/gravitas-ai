import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import profileRouter from "./routes/profile";
import planRouter from "./routes/plan";
import { errorHandler } from "./middleware/error";

dotenv.config();

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.some((o) => origin.startsWith(o))) {
        cb(null, true);
      } else {
        cb(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());

app.use("/api/profile", profileRouter);
app.use("/api/plan", planRouter);

app.use(errorHandler);

export default app;
