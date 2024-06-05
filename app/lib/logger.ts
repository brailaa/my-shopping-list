const fileName = process.env.PINO_LOG_FILE || "./log/app.log";
const pino = require("pino");
import { Logger } from "pino";

const pinoTransport =
  process.env.NODE_ENV === "development"
    ? {
        targets: [
          {
            target: "pino/file",
            level: process.env.PINO_LOG_LEVEL || "trace",
            options: { destination: fileName, mkdir: true },
          },
          {
            target: "pino-pretty",
            level: process.env.PINO_LOG_LEVEL || "trace",
          },
        ],
      }
    : {
        target: "pino/file",
        options:
          process.env.DEPLOYMENT === "local"
            ? { destination: 1 }
            : { destination: fileName, mkdir: true },
      };

/** Pino Logger used for send log messages to STDOUT + log file. */
export const logger: Logger = pino({
  transport: pinoTransport,
  level:
    process.env.PINO_LOG_LEVEL ||
    (process.env.NODE_ENV === "development" ? "trace" : "info"),
  base: {
    env: process.env.NODE_ENV,
    pid: process.pid,
  },
  redact: [],
  nestedKey: "data",
  timestamp: pino.stdTimeFunctions.isoTime,
});
