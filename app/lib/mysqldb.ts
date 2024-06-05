import {
  createPool,
  PoolOptions,
  Pool,
  ResultSetHeader,
  RowDataPacket,
  PoolConnection,
} from "mysql2/promise";
import { logger } from "@/app/lib/logger";
import { ensureError } from "./utils";
import { CustomError } from "./custom-error";

export class MySQL {
  private pool: Pool;
  private conn!: PoolConnection;
  private credentials: PoolOptions;

  constructor(credentials: PoolOptions) {
    this.credentials = credentials;
    this.pool = createPool(this.credentials);
  }

  closeConnection() {
    if (this?.pool && this.conn) {
      logger.debug({ tag: "db" }, "MySQL connection was closed.");
      this.pool.releaseConnection(this.conn);
      this.conn.release();
    }
  }

  /** A random method to simulate a step before to get the class methods */
  public async ensureConnection() {
    try {
      if (!this?.pool) {
        this.pool = createPool(this.credentials);
        logger.debug({ id: this.pool.threadId }, "MySQL pool created");
      }
      if (!this?.conn) {
        this.conn = await this.pool.getConnection();
        logger.debug(
          { id: this.connection.threadId },
          "MySQL connection created"
        );
      }
    } catch (err) {
      const error = ensureError(err);
      let newError;
      if (error && "code" in error) {
        switch (error.code) {
          case "ECONNREFUSED":
            newError = new CustomError("Connection refused", error.code, {
              cause: error,
            });
            break;
          case "ER_ACCESS_DENIED_ERROR":
            newError = new CustomError("Access denied [server]", error.code, {
              cause: error,
            });
            break;
          case "ER_DBACCESS_DENIED_ERROR":
            newError = new CustomError("Access denied [db]", error.code, {
              cause: error,
            });
            break;
          default:
            newError = new CustomError(
              "Other DB connection error",
              typeof error.code === "string" ? error.code : undefined,
              { cause: error }
            );
        }
      } else {
        newError = new CustomError("Other DB connection error", undefined, {
          cause: error,
        });
      }
      logger.error(newError);
      throw newError;
    }
  }

  /** For `SELECT` and `SHOW` */
  get queryRows() {
    return this.conn.query.bind(this.conn)<RowDataPacket[]>;
  }

  /** For `SELECT` and `SHOW` with `rowAsArray` as `true` */
  get queryRowsAsArray() {
    return this.conn.query.bind(this.conn)<RowDataPacket[][]>;
  }

  /** For `INSERT`, `UPDATE`, etc. */
  get queryResult() {
    return this.conn.query.bind(this.conn)<ResultSetHeader>;
  }

  /** For multiple `INSERT`, `UPDATE`, etc. with `multipleStatements` as `true` */
  get queryResults() {
    return this.conn.query.bind(this.conn)<ResultSetHeader[]>;
  }

  /** For `SELECT` and `SHOW` */
  get executeRows() {
    return this.conn.execute.bind(this.conn)<RowDataPacket[]>;
  }

  /** For `SELECT` and `SHOW` with `rowAsArray` as `true` */
  get executeRowsAsArray() {
    return this.conn.execute.bind(this.conn)<RowDataPacket[][]>;
  }

  /** For `INSERT`, `UPDATE`, etc. */
  get executeResult() {
    return this.conn.execute.bind(this.conn)<ResultSetHeader>;
  }

  /** For multiple `INSERT`, `UPDATE`, etc. with `multipleStatements` as `true` */
  get executeResults() {
    return this.conn.execute.bind(this.conn)<ResultSetHeader[]>;
  }

  /** Expose the Pool Connection */
  get connection() {
    return this.conn;
  }
}
