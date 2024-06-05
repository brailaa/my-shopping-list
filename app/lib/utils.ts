import { ZodIssue } from "zod";
import { ShoppingListRow, ShoppingListRowRaw } from "./definitions";
import { logger } from "@/app/lib/logger";

/** Flattens errors from zod schema.
 * The record returned has a key for every path found in issues,
 * and the corresponding value concats all error messages.
 * @param errorsArray array of issues
 * @param singleMessage optional parameter, true to return a single message
 */
export function getIssuesAsRecord(
  errorsArray: ZodIssue[],
  singleMessage = false
) {
  let errors: Record<string, string> = {};
  errorsArray.map((e) => {
    let key = singleMessage ? "general" : e.path[0].toString();
    let mes =
      (singleMessage ? e.path[0].toString() + ": " : "") + e.message + ". ";
    if (!(key in errors)) {
      errors[key] = mes;
    } else {
      errors[key] += mes;
    }
  });
  return errors;
}

export const sleep = (duration: number) =>
  new Promise((resolve) => setTimeout(resolve, duration));

/** Used to simulate db delays and/or errors.
 * Has effect only in development mode.
 */
export async function delayDb(msMin: number = 1000, msMax: number = 3000) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }
  const delay = msMin + Math.random() * (msMax - msMin);
  await sleep(delay);
  logger.debug({ elapsed: delay }, "DB delay");
}

/** Convert list row to raw format. */
export function rowToRaw(row: ShoppingListRow): ShoppingListRowRaw {
  return {
    id: row.id,
    listid: row.list.id,
    product: row.product.id,
    index: row.rowIndex,
    quantity: row.quantity,
    checked: row.isChecked,
  };
}

/** Ensure that caught errors are Error instances */
export function ensureError(value: unknown): Error | undefined {
  if (value instanceof Error) {
    return value;
  } else if (value === null || value === undefined) {
    return undefined;
  }
  let stringifiedValue = "Error";
  try {
    stringifiedValue = JSON.stringify(value);
  } catch {}
  return new Error(stringifiedValue);
}

/** Logs specific error when not finding row */
export function rowNotFoundError(id: string, table: string) {
  logger.error({ id: id, table: table }, "Row not found");
}
