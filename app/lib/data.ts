"use server";

import { PoolOptions, ResultSetHeader } from "mysql2/promise";
import { MySQL } from "@/app/lib/mysqldb";
import { unstable_noStore as noStore } from "next/cache";
import {
  Category,
  CategoryPlus,
  Product,
  ProductRaw,
  RowAction,
  ShoppingList,
  ShoppingListRow,
  ShoppingListRowRaw,
  State,
  ViewShoppingRow,
} from "./definitions";
import { delayDb, ensureError, rowNotFoundError } from "./utils";
import { logger } from "@/app/lib/logger";
import { CustomError } from "./custom-error";

/** Options used to connect to MySQL Database */
const dbOptions: PoolOptions = {
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  multipleStatements: true,
};

/** Database connection */
const db = new MySQL(dbOptions);

/** Executes a SELECT command and returns the result.
 * @param sql SELECT command
 * @param params optional parameters for the command
 * @returns rows and columns resulted
 */
async function ExecuteSQL<T>(sql: string, ...params: any): Promise<T[]> {
  try {
    await db.ensureConnection();
    logger.debug({ query: sql, params: params }, `Execute SQL query`);
    await delayDb(500, 1500);
    const start = performance.now();
    const [rows, _columns] = await db.queryRows(sql, params);
    const end = performance.now();
    logger.trace(
      {
        elapsed: (end - start).toFixed(3),
        rows: rows.length,
        query: sql,
        params: params,
      },
      "SQL query executed"
    );
    return rows as T[];
  } catch (err) {
    const error = ensureError(err);
    const newError = new CustomError("Error executing sql query", undefined, {
      cause: error,
      context: { query: sql, params: params },
    });
    //logger.error(newError);
    throw newError;
  }
}

/** Executes UPDATE/INSERT/DELETE statement and returns the result.
 * @param sql SQL statement
 * @param params optional statement parameters
 * @returns statement result
 */
async function ExecuteResultSQL(
  sql: string,
  ...params: any
): Promise<ResultSetHeader> {
  try {
    await db.ensureConnection();
    logger.debug({ query: sql, params: params }, `Execute SQL statement`);
    await delayDb(1000, 2000);
    const start = performance.now();
    const [result] = await db.executeResult(sql, params);
    const end = performance.now();
    let resultContext: {
      elapsed: string;
      rows: number;
      query: string;
      params: any;
      id?: number;
      info?: string;
      warning?: number;
    } = {
      elapsed: (end - start).toFixed(3),
      rows: result.affectedRows,
      query: sql,
      params: params,
    };
    if (result.insertId) {
      resultContext.id = result.insertId;
    }
    if (result.info) {
      resultContext.info = result.info;
    }
    if (result.warningStatus) {
      resultContext.warning = result.warningStatus;
    }
    logger.trace(resultContext, "SQL statement executed");
    return result;
  } catch (err) {
    const error = ensureError(err);
    let errorCode = undefined;
    //verify error type and set the error code
    if (error?.message.includes("Duplicate entry")) {
      errorCode = "duplicate";
    }
    const newError = new CustomError(
      "Error executing sql statement",
      errorCode,
      { cause: error, context: { query: sql, params: params } }
    );
    //logger.error(newError);
    throw newError;
  }
}

/** Executes multiple statements in one transaction.
 * @param sql SQL statements
 * @param params optional statements parameters
 * @returns true if ALL statements were successfully executed, false otherwise
 */
async function ExecuteMultipleSQL(
  sql: string[],
  ...params: any[]
): Promise<number> {
  try {
    await db.ensureConnection();
    await db.connection.beginTransaction();
    logger.debug(
      { query: sql, params: params },
      `Execute SQL multiple statements`
    );
    await delayDb();
    const start = performance.now();
    let totalRows = 0;
    for (let i = 0; i < sql.length; i++) {
      const s = sql[i];
      const p = params && params.length > i ? params[i] : undefined;
      try {
        const [result] = await db.executeResult(s, p);
        totalRows += result.affectedRows;
      } catch (err) {
        const error = ensureError(err);
        const newError = new CustomError(
          "Error executing sql statement",
          undefined,
          { cause: error, context: { query: s, params: p } }
        );
        throw newError;
      }
    }
    await db.connection.commit();
    const end = performance.now();
    let resultContext = {
      elapsed: (end - start).toFixed(3),
      rows: totalRows,
      query: sql,
      params: params,
    };
    logger.trace(resultContext, "SQL multiple statements executed");
    return totalRows;
  } catch (err) {
    await db.connection.rollback();
    const error = ensureError(err);
    const newError = new CustomError(
      "Error executing sql multiple statements",
      undefined,
      {
        cause: error,
        context:
          error instanceof CustomError && error.context
            ? error.context
            : { query: sql, params: params },
      }
    );
    //logger.error(newError);
    throw newError;
  }
}

/** Get the shopping list and rows. */
export async function fetchShoppingList(products: Product[]): Promise<State> {
  noStore();
  logger.info("Fetch shopping list");
  try {
    let sql = `SELECT id,DATE_FORMAT(date,'%Y-%m-%d') AS date,text FROM shopping_list LIMIT 1`;
    const list = await ExecuteSQL<ShoppingList>(sql);
    let resultList: ShoppingList = { id: 0, date: "", text: "" };
    const resultRows: ShoppingListRow[] = [];
    if (list && list.length > 0) {
      resultList = list[0];
      logger.trace({ id: resultList.id }, "Shopping List fetched");
      sql = `SELECT id,listId AS listid,productId AS product,rowIndex AS 'index',quantity,isChecked AS checked FROM shopping_list_rows WHERE listId=? ORDER BY rowIndex`;
      const rows = await ExecuteSQL<ShoppingListRowRaw>(sql, resultList.id);
      logger.trace({ rows: rows.length }, "Shopping List Rows fetched");
      if (rows && rows.length > 0) {
        rows.map((r) => {
          let prod = products.find((p) => p.id == r.product);
          if (prod) {
            resultRows.push({
              id: r.id,
              list: resultList,
              product: prod,
              rowIndex: r.index,
              quantity: r.quantity,
              isChecked: r.checked,
            });
          }
        });
      }
    }
    return { success: true, values: [resultList, resultRows] };
  } catch (err) {
    const error = ensureError(err);
    const newError = new CustomError(
      "Error fetching shopping list",
      undefined,
      { cause: error }
    );
    logger.error(newError);
    // simple error message to the client
    return {
      success: false,
      errors: { general: "Error fetching shopping list!" },
    };
  }
}

/** Get the archive list. */
export async function fetchArchives(): Promise<State> {
  noStore();
  logger.info("Fetch archives");
  let noList: ShoppingList[] = [];
  try {
    let sql = `SELECT id,DATE_FORMAT(date,'%Y-%m-%d') AS date,text FROM old_shopping_list ORDER BY date DESC`;
    const rows = await ExecuteSQL<ShoppingList>(sql);
    logger.trace({ rows: rows.length }, "Archives fetched");
    return { success: true, values: rows };
  } catch (err) {
    const error = ensureError(err);
    const newError = new CustomError("Error fetching archives", undefined, {
      cause: error,
    });
    logger.error(newError);
    // simple error message to the client
    return { success: false, errors: { general: "Error fetching archives!" } };
  }
}

/** Get the archive details and rows. */
export async function fetchArchiveDetails(id: string): Promise<State> {
  noStore();
  logger.info({ id: id }, "Fetch archive details");
  try {
    let sql = `SELECT id,DATE_FORMAT(date,'%Y-%m-%d') AS date,text FROM old_shopping_list WHERE id=?`;
    const list = await ExecuteSQL<ShoppingList>(sql, id);
    if (list && list.length > 0) {
      logger.trace({ id: list[0].id }, "Archive fetched");
      sql = `SELECT r.id,r.rowIndex AS 'index','' AS categoryName,p.name AS productName,r.quantity,r.isChecked AS checked FROM old_shopping_list_rows r INNER JOIN products p ON r.productId=p.id WHERE r.listId=? ORDER BY r.rowIndex`;
      const rows = await ExecuteSQL<ViewShoppingRow>(sql, list[0].id);
      logger.trace({ rows: rows.length }, "Archive Rows fetched");
      return { success: true, values: [list[0], rows] };
    } else {
      rowNotFoundError(id, "old_shopping_list");
      throw null;
    }
  } catch (err) {
    const error = ensureError(err);
    const newError = new CustomError(
      "Error fetching archive details",
      undefined,
      { cause: error, context: { id: id } }
    );
    logger.error(newError);
    // simple error message to the client
    return {
      success: false,
      errors: { general: "Error fetching archive details!" },
    };
  }
}

/** Get the products. */
export async function fetchProducts(categories: Category[]): Promise<State> {
  noStore();
  logger.info("Fetch products");
  try {
    const sql = `SELECT id,categoryId,name FROM products ORDER BY name`;
    const rows = await ExecuteSQL<ProductRaw>(sql);
    logger.trace({ rows: rows.length }, "Products fetched");
    const resultRows: Product[] = [];
    if (rows && rows.length > 0) {
      rows.map((r) => {
        let cat = categories.find((c) => c.id == r.categoryId);
        if (cat) {
          resultRows.push({
            id: r.id,
            category: cat,
            name: r.name,
          });
        }
      });
    }
    return { success: true, values: resultRows };
  } catch (err) {
    const error = ensureError(err);
    const newError = new CustomError("Error fetching products", undefined, {
      cause: error,
    });
    logger.error(newError);
    // simple error message to the client
    return { success: false, errors: { general: "Error fetching products!" } };
  }
}

/** Get the categories. */
export async function fetchCategories(): Promise<State> {
  noStore();
  logger.info("Fetch categories");
  try {
    const sql = `SELECT id,name FROM categories ORDER BY name`;
    const rows = await ExecuteSQL<Category>(sql);
    logger.trace({ rows: rows.length }, "Categories fetched");
    return { success: true, values: rows };
  } catch (err) {
    const error = ensureError(err);
    const newError = new CustomError("Error fetching categories", undefined, {
      cause: error,
    });
    logger.error(newError);
    // simple error message to the client
    return {
      success: false,
      errors: { general: "Error fetching categories!" },
    };
  }
}

/** Get the categories + no. of products. */
export async function fetchCategoriesPlus(): Promise<State> {
  noStore();
  logger.info("Fetch categories+");
  try {
    const sql = `SELECT c.id,c.name,COUNT(p.id) AS products FROM categories c LEFT JOIN products p ON c.id=p.categoryId GROUP BY c.name,c.id`;
    const rows = await ExecuteSQL<CategoryPlus>(sql);
    logger.trace({ rows: rows.length }, "Categories+ fetched");
    return { success: true, values: rows };
  } catch (err) {
    const error = ensureError(err);
    const newError = new CustomError("Error fetching categories+", undefined, {
      cause: error,
    });
    logger.error(newError);
    // simple error message to the client
    return {
      success: false,
      errors: { general: "Error fetching categories!" },
    };
  }
}

/** Insert shopping list.
 * @returns if succes, returns the id of updated row
 */
export async function CreateShoppingList(
  date: string,
  text = ""
): Promise<number> {
  logger.info({ date: date, text: text }, "Create Shopping List");
  let id = 0;
  try {
    const sql = `INSERT INTO shopping_list (date,text) VALUES(?,?)`;
    const result = await ExecuteResultSQL(sql, date, text);
    id = result.insertId;
  } catch (err) {
    const error = ensureError(err);
    const errorCode = error instanceof CustomError ? error.code : "";
    const newError = new CustomError(
      "Error inserting shopping list",
      errorCode,
      {
        cause: error,
        context: { date: date, text: text },
      }
    );
    //logger.error(newError);
    throw newError;
  }
  return id;
}

/** Update shopping list.
 * @returns if succes, returns the id of updated row
 */
export async function UpdateShoppingList(list: ShoppingList): Promise<number> {
  logger.info({ id: list.id }, "Update Shopping List");
  try {
    const sql = `UPDATE shopping_list SET date=?,text=? WHERE id=?`;
    const result = await ExecuteResultSQL(sql, list.date, list.text, list.id);
    if (result.affectedRows === 1) {
      return list.id;
    } else {
      rowNotFoundError(list.id.toString(), "shopping_list");
      throw null;
    }
  } catch (err) {
    const error = ensureError(err);
    const errorCode = error instanceof CustomError ? error.code : "";
    const newError = new CustomError(
      "Error updating shopping list",
      errorCode,
      { cause: error, context: list }
    );
    //logger.error(newError);
    throw newError;
  }
}

/** Insert a shopping list row.
 * @returns id number of the row if  the action succeded, else 0
 */
export async function CreateShoppingListRow(
  newRow: ShoppingListRow
): Promise<State> {
  logger.info("Create Shopping List Row");
  let id = 0;
  try {
    const sql = `INSERT INTO shopping_list_rows (listId,productId,rowIndex,quantity,isChecked) VALUES(?,?,?,?,?)`;
    const result = await ExecuteResultSQL(
      sql,
      newRow.list.id,
      newRow.product.id,
      newRow.rowIndex,
      newRow.quantity,
      newRow.isChecked
    );
    return { success: true, values: result.insertId };
  } catch (err) {
    const error = ensureError(err);
    const errorCode = error instanceof CustomError ? error.code : "";
    const newError = new CustomError(
      "Error inserting shopping list row",
      errorCode,
      {
        cause: error,
        context: newRow,
      }
    );
    logger.error(newError);
    // simple error message to the client
    return {
      success: false,
      errors: { general: "Error inserting shopping list row!" },
    };
  }
}

/** Updates shopping list row quantity.
 * Called when creating a new row with same product of another row,
 * or at saving an existing row with same product of another row,
 * so the old row will sum up the quantities.
 * When called at saving row, the edited row .
 * @param id id of the row to be updated
 * @param quantity new quantity to be saved
 * @param deleteId (optional) id od the row to be deleted
 */
export async function UpdateShoppingListRowQuantity(
  id: number,
  quantity: number,
  deleteId: number = 0
): Promise<State> {
  logger.info(
    { id: id, quantity: quantity, deleteId: deleteId },
    "Update Shopping List Row Quantity"
  );
  try {
    const sql = [
      `UPDATE shopping_list_rows SET quantity=? WHERE id=?`,
      `DELETE FROM shopping_list_rows WHERE id=?`,
    ];
    const result =
      deleteId > 0
        ? await ExecuteMultipleSQL(sql, [quantity, id], [deleteId])
        : (await ExecuteResultSQL(sql[0], quantity, id)).affectedRows;
    if (result === 0) {
      throw null;
    } else {
      return { success: true };
    }
  } catch (err) {
    const error = ensureError(err);
    const errorCode = error instanceof CustomError ? error.code : "";
    const newError = new CustomError(
      "Error updating shopping list row quantity",
      errorCode,
      {
        cause: error,
        context: { id: id, quantity: quantity, deleteId: deleteId },
      }
    );
    logger.error(newError);
    return { success: false };
  }
}

/** Updates shopping list row product, quantity and/or check flag.
 * Called when saving Edit Form or at changing row directly in list page
 * @returns id number of the row if the action succeded, else 0
 */
export async function UpdateShoppingListRow(action: RowAction): Promise<State> {
  logger.info(action, "Update Shopping List Row");
  try {
    const sql =
      `UPDATE shopping_list_rows SET` +
      (action.type === "row" ? ` productId=?,` : "") +
      (action.type === "check" ? ` isChecked=?` : ` quantity=?`) +
      ` WHERE id =?`;
    const params: string[] = [];
    if (action.type === "row") {
      params.push(action.product.toString());
    }
    params.push(
      action.type === "check"
        ? action.checked
          ? "1"
          : "0"
        : action.quantity.toString()
    );
    params.push(action.id.toString());
    const result = await ExecuteResultSQL(sql, ...params);
    if (result.affectedRows !== 1) {
      rowNotFoundError(action.id.toString(), "shopping_list_rows");
      throw null;
    }
    return { success: true, values: action.id };
  } catch (err) {
    const error = ensureError(err);
    const errorCode = error instanceof CustomError ? error.code : "";
    const newError = new CustomError(
      "Error updating shopping list row",
      errorCode,
      {
        cause: error,
        context: action,
      }
    );
    logger.error(newError);
    return { success: false };
  }
}

/** Deletes shopping list row.
 * @returns id number of the row if the action succeded, else 0
 */
export async function DeleteShoppingListRow(rowId: number): Promise<State> {
  logger.info({ id: rowId }, "Delete Shopping List Row");
  try {
    const sql = `DELETE FROM shopping_list_rows WHERE id=?`;
    const result = await ExecuteResultSQL(sql, rowId);
    if (result.affectedRows !== 1) {
      rowNotFoundError(rowId.toString(), "shopping_list_rows");
      throw null;
    }
    return { success: true, values: rowId };
  } catch (err) {
    const error = ensureError(err);
    const newError = new CustomError(
      "Error deleting shopping list row",
      undefined,
      { cause: error }
    );
    logger.error(newError);
    return { success: false };
  }
}

/** Moves list and list rows to old list and old list rows. */
export async function ArchiveShoppingList(): Promise<State> {
  logger.info("Archive Shopping List");
  try {
    const sql = [
      `INSERT INTO old_shopping_list SELECT * FROM shopping_list;`,
      `INSERT INTO old_shopping_list_rows SELECT * FROM shopping_list_rows;`,
      `DELETE FROM shopping_list_rows WHERE id>0;`,
      `DELETE FROM shopping_list WHERE id>0;`,
    ];
    await ExecuteMultipleSQL(sql);
    logger.trace("Shopping List Archived");
    return { success: true };
  } catch (err) {
    const error = ensureError(err);
    const newError = new CustomError(
      "Error archiving shopping list",
      undefined,
      { cause: error }
    );
    //logger.error(newError);
    throw newError;
  }
}

/** Insert category.
 * @returns if success, returns the id of updated row
 */
export async function CreateCategory(name: string): Promise<number> {
  logger.info({ name: name }, "Create Category");
  let id = 0;
  try {
    const sql = `INSERT INTO categories (name) VALUES(?)`;
    const result = await ExecuteResultSQL(sql, name);
    if (result && result.insertId > 0) {
      id = result.insertId;
    }
  } catch (err) {
    const error = ensureError(err);
    const errorCode = error instanceof CustomError ? error.code : "";
    const newError = new CustomError("Error inserting category", errorCode, {
      cause: error,
      context: { name: name },
    });
    //logger.error(newError);
    throw newError;
  }
  return id;
}

/** Get the category details and products. */
export async function fetchCategoryDetails(id: string): Promise<State> {
  noStore();
  logger.info({ id: id }, "Fetch category details");
  let category: Category = { id: 0, name: "" };
  let products: Product[] = [];
  try {
    let sql = `SELECT id,name FROM categories WHERE id=?`;
    const list = await ExecuteSQL<Category>(sql, id);
    if (list && list.length > 0) {
      category = list[0];
      logger.trace({ id: category.id }, "Category fetched");
      sql = `SELECT id,name,categoryId FROM products WHERE categoryId=? ORDER BY name`;
      const rows = await ExecuteSQL<ProductRaw>(sql, category.id);
      logger.trace({ rows: rows.length }, "Products fetched");
      rows.map((p) =>
        products.push({
          id: p.id,
          name: p.name,
          category: category,
        })
      );
      return { success: true, values: [category, products] };
    } else {
      rowNotFoundError(id, "category");
      throw null;
    }
  } catch (err) {
    const error = ensureError(err);
    const newError = new CustomError(
      "Error fetching category details",
      undefined,
      { cause: error, context: { id: id } }
    );
    logger.error(newError);
    // simple error message to the client
    return {
      success: false,
      errors: { general: "Error fetching category details!" },
    };
  }
}

/** Get a category. */
export async function fetchCategory(id: string): Promise<State> {
  noStore();
  logger.info({ id: id }, "Fetch category");
  try {
    const sql = `SELECT id,name FROM categories WHERE id=?`;
    const rows = await ExecuteSQL<Category>(sql, id);
    if (rows && rows.length > 0) {
      logger.trace({ id: rows[0].id }, "Category fetched");
      return { success: true, values: rows[0] };
    } else {
      rowNotFoundError(id, "categories");
      throw undefined;
    }
  } catch (err) {
    const error = ensureError(err);
    const newError = new CustomError("Error fetching category", undefined, {
      cause: error,
      context: { id: id },
    });
    logger.error(newError);
    // simple error message to the client
    return { success: false, errors: { general: "Error fetching category!" } };
  }
}

/** Update category.
 * @returns if success, returns the id of updated row
 */
export async function UpdateCategory(category: Category): Promise<number> {
  logger.info({ id: category.id }, "Update Category");
  let id = 0;
  try {
    const sql = `UPDATE categories SET name=? WHERE id=?`;
    const result = await ExecuteResultSQL(sql, category.name, category.id);
    if (result && result.affectedRows === 1) {
      id = category.id;
    }
    return id;
  } catch (err) {
    const error = ensureError(err);
    const errorCode = error instanceof CustomError ? error.code : "";
    const newError = new CustomError("Error updating category", errorCode, {
      cause: error,
      context: category,
    });
    //logger.error(newError);
    throw newError;
  }
}

/** Insert product.
 * @returns if success, returns the id of updated row
 */
export async function CreateProduct(
  name: string,
  categoryId: number
): Promise<number> {
  logger.info({ name: name, categoryId: categoryId }, "Create Product");
  let id = 0;
  try {
    const sql = `INSERT INTO products (name,categoryId) VALUES(?,?)`;
    const result = await ExecuteResultSQL(sql, name, categoryId);
    if (result && result.insertId > 0) {
      id = result.insertId;
    }
    return id;
  } catch (err) {
    const error = ensureError(err);
    const errorCode = error instanceof CustomError ? error.code : "";
    const newError = new CustomError("Error inserting product", errorCode, {
      cause: error,
      context: { name: name, categoryId: categoryId },
    });
    //logger.error(newError);
    throw newError;
  }
}

/** Update product.
 * @returns if success, returns the id of updated row
 */
export async function UpdateProduct(product: ProductRaw): Promise<number> {
  logger.info({ id: product.id }, "Update product");
  let id = 0;
  try {
    const sql = `UPDATE products SET name=?,categoryId=? WHERE id=?`;
    const result = await ExecuteResultSQL(
      sql,
      product.name,
      product.categoryId,
      product.id
    );
    if (result && result.affectedRows === 1) {
      id = product.id;
    }
    return id;
  } catch (err) {
    const error = ensureError(err);
    const errorCode = error instanceof CustomError ? error.code : "";
    const newError = new CustomError("Error updating product", errorCode, {
      cause: error,
      context: product,
    });
    //logger.error(newError);
    throw newError;
  }
}

/** Get a product. */
export async function fetchProduct(id: string): Promise<State> {
  noStore();
  logger.info({ id: id }, "Fetch product");
  try {
    const sql = `SELECT id,name,categoryId FROM products WHERE id=?`;
    const rows = await ExecuteSQL<ProductRaw>(sql, id);
    if (rows && rows.length > 0) {
      return { success: true, values: rows[0] };
    } else {
      rowNotFoundError(id, "products");
      throw null;
    }
  } catch (err) {
    const error = ensureError(err);
    const newError = new CustomError("Error fetching product", undefined, {
      cause: error,
    });
    logger.error(newError);
    // simple error message to the client
    return { success: false, errors: { general: "Error fetching product!" } };
  }
}
