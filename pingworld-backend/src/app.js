import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import ApiResponse from "./models/apiResponse.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import prisma from "./config/prisma.js";
import http from "http";
import { setupSocketIO } from "./config/socketSetup.js";
import { loadAndCacheAchievements } from "./services/achievementService.js";

const app = express();
const port = process.env.PORT || 3001;
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : [];
dotenv.config();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === "development") {
        callback(null, true);
      } else {
        callback(new Error("The CORS policy for this site does not allow access from the specified Origin."), false);
      }
    },
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1/", authRoutes);

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return ApiResponse.BadRequestError("Invalid JSON format.");
  }
  next(error);
});

app.use(errorMiddleware);

await loadAndCacheAchievements();
const httpServer = http.createServer(app);
const io = setupSocketIO(httpServer);

httpServer.listen(port, () => {
  console.log(`Server started on: http://localhost:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

async function gracefulShutdown(signal) {
  console.log(`${signal} signal received: Starting graceful shutdown...`);

  io.close(async () => {
    console.log("Socket.IO server closed.");

    httpServer.close(async (err) => {
      if (err) {
        if (err.code !== "ERR_SERVER_NOT_RUNNING") console.error("Error during HTTP server close:", err);
        process.exitCode = 1;
      }
      console.log("HTTP server closed.");

      try {
        await prisma.$disconnect();
        console.log("Prisma client disconnected.");
      } catch (e) {
        console.error("Error disconnecting Prisma:", e);
        if (!process.exitCode) process.exitCode = 1;
      }

      console.log("Graceful shutdown completed.");
      process.exit();
    });
  });

  // If server hasn't finished shutting down in X seconds, force exit
  setTimeout(() => {
    console.error("Graceful shutdown timed out. Forcefully exiting.");
    process.exit(1); // Force exit with error
  }, 10000); // 10 seconds
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
