import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import ApiResponse from "./models/apiResponse.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import prisma from "./config/prisma.js";

const app = express();
const port = process.env.PORT || 3001;
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

app.use('/api/v1/', authRoutes);

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return ApiResponse.BadRequestError("Invalid JSON format.");
  }
  next(error);
});

app.use(errorMiddleware);

const server = app.listen(port, () => {
  console.log(`Server started on: http://localhost:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

async function gracefulShutdown() {
  console.log('Attempting graceful shutdown...');
  try {
    server.close(async (err) => {
      if (err) {
        console.error('Error closing HTTP server:', err);
        process.exit(1);
      }
      console.log('HTTP server closed.');

      await prisma.$disconnect();
      console.log('Prisma client disconnected.');
      process.exit(0);
    });

    // If server.close doesn't exit after a timeout, force exit
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000); // 10 seconds timeout

  } catch (e) {
    console.error('Error during graceful shutdown:', e);
    process.exit(1);
  }
}

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
