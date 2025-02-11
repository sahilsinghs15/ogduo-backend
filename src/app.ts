"use strict";
import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
import { blockJWT, protect } from "./middleware/auth/index";
import globalRouter from "./routes/global";
import authRouter from "./routes/auth";
import services from "./routes/services";
import { ErrorHandler } from "./controller/error/ErrorHandler";
import user from "./routes/user";
import http from "http";
import helmet from "helmet";
import {
  apiLimiter,
  authRateLimiter,
} from "./middleware/validation/rateLimiter";
import chat from "./routes/chat";
import fs from "fs";
import path from "path";
import RedisStore from "connect-redis";
import session from "express-session";
import redis from "redis";
import { createClient } from "redis";

let redisClient = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    reconnectStrategy: (retries: number, cause: Error) => {
      if (retries > 10) return false;
      return Math.min(retries * 100, 3000);
    }
  }
});

redisClient.connect().catch(console.error);
redisClient.on("ready", () => {
  console.log("Client is ready");
  // redisClient.flushDb().then((e) => {
  //   console.log("flush", e);
  // });
});

redisClient.on("error", (err) => {
  console.error("Error occurred:", err);
});

let redisStore = new RedisStore({
  client: redisClient,
  prefix: "qui:",
});

const app = express();

const server = http.createServer(app);
export const sessionMiddleWare = session({
  secret: process.env.SECRET as string,
  resave: true,
  saveUninitialized: false,
  store: redisStore,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  }
});
server.headersTimeout = 5000;
server.requestTimeout = 10000;
app.set("trust proxy", 1);
app.use(sessionMiddleWare);

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(helmet());
var accessLogStream = fs.createWriteStream(path.join("./", "access.log"), {
  flags: "a",
});

// setup the logger
app.use(morgan("combined", { stream: accessLogStream }));
app.use(morgan("combined"));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);
app.use("/api", globalRouter);

app.use("/api/auth", authRateLimiter, authRouter);

app.use("/api/services", blockJWT as any, protect as any, services);
app.use("/api/user", blockJWT as any, user);//
app.use("/api/chat", blockJWT as any, protect as any, chat);
app.use(ErrorHandler as any);
export default server;
