"use server";

import {
  State,
  ShoppingList,
  ShoppingListRowRaw,
  Category,
  Product,
  ProductRaw,
} from "./definitions";
import {
  CategorySchema,
  ProductSchema,
  ShoppingListRowSchema,
  ShoppingListSchema,
} from "@/app/lib/schemas";
import { ensureError, getIssuesAsRecord } from "./utils";
import {
  CreateShoppingList,
  CreateShoppingListRow,
  UpdateShoppingListRow,
  UpdateShoppingList,
  ArchiveShoppingList,
  CreateCategory,
  UpdateCategory,
  CreateProduct,
  UpdateProduct,
} from "./data";
import { revalidatePath } from "next/cache";
import { CustomError } from "./custom-error";
import { logger } from "@/app/lib/logger";

/** create shopping list action */
export async function createShoppingList(
  _: State,
  formData: FormData
): Promise<State> {
  let result: State = { success: true };
  let errors: Record<string, string> = { general: "" };
  try {
    const validatedFields = ShoppingListSchema.omit({ id: true }).safeParse(
      Object.fromEntries(formData)
    );
    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
      errors = getIssuesAsRecord(validatedFields.error.issues, true);
      throw new Error("Error validating data!");
    }

    // Prepare data for insertion into the database
    const { date, text } = validatedFields.data;
    //Insert data into the database
    const id = await CreateShoppingList(date, text);

    if (id === 0) {
      //fail
      throw new Error("Error inserting data!");
    } else {
      //success
      result.values = { id: id, date: date, text: text };
    }
  } catch (err) {
    const error = ensureError(err);
    errors.general +=
      error?.message +
      (error instanceof CustomError && error.code ? ` (${error.code})` : "");
    logger.error(error);
    result = { success: false, errors: errors };
  }
  return result;
}

/** update shopping list action */
export async function updateShoppingList(
  _: State,
  formData: FormData
): Promise<State> {
  let result: State = { success: true };
  let errors: Record<string, string> = { general: "" };
  try {
    const validatedFields = ShoppingListSchema.safeParse(
      Object.fromEntries(formData)
    );
    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
      errors = getIssuesAsRecord(validatedFields.error.issues, true);
      throw new Error("Error validating data!");
    }

    // Prepare data for insertion into the database
    const list: ShoppingList = validatedFields.data;
    //Insert data into the database
    const idResponse = await UpdateShoppingList(list);

    if (list.id !== idResponse) {
      //fail
      throw new Error("Error updating data!");
    } else {
      //succes
      result.values = list;
    }
  } catch (err) {
    const error = ensureError(err);
    errors.general +=
      error?.message +
      (error instanceof CustomError && error.code ? ` (${error.code})` : "");
    logger.error(error);
    result = { success: false, errors: errors };
  }
  return result;
}

/** moves shopping list and rows to archive  */
export async function archiveShoppingList(): Promise<State> {
  let result: State = { success: true };
  let errors: Record<string, string> = { general: "" };
  try {
    const result = await ArchiveShoppingList();
    if (!result?.success) {
      throw new Error("Error archiving list!");
    }
    revalidatePath("/archive");
  } catch (err) {
    const error = ensureError(err);
    errors.general +=
      error?.message +
      (error instanceof CustomError && error.code ? ` (${error.code})` : "");
    logger.error(error);
    result = { success: false, errors: errors };
  }
  return result;
}

/** create new category */
export async function createCategory(
  _: State,
  formData: FormData
): Promise<State> {
  let result: State = { success: true };
  let errors: Record<string, string> = { general: "" };
  try {
    const validatedFields = CategorySchema.omit({ id: true }).safeParse(
      Object.fromEntries(formData)
    );
    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
      errors = getIssuesAsRecord(validatedFields.error.issues, true);
      throw new Error("Error validating data!");
    }

    // Prepare data for insertion into the database
    const { name } = validatedFields.data;
    const id = await CreateCategory(name);
    if (id === 0) {
      throw new Error("Error saving data!");
    } else {
      //succes
      result.values = { id: id, name: name };
      revalidatePath("/categories");
    }
  } catch (err) {
    const error = ensureError(err);
    errors.general +=
      error?.message +
      (error instanceof CustomError && error.code ? ` (${error.code})` : "");
    logger.error(error);
    result = { success: false, errors: errors };
  }
  return result;
}

/** update category */
export async function updateCategory(
  _: State,
  formData: FormData
): Promise<State> {
  let result: State = { success: true };
  let errors: Record<string, string> = { general: "" };
  try {
    const validatedFields = CategorySchema.safeParse(
      Object.fromEntries(formData)
    );
    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
      errors = getIssuesAsRecord(validatedFields.error.issues, true);
      throw new Error("Error validating data!");
    }

    // Prepare data for updating the database
    const category: Category = validatedFields.data;
    const updatedId = await UpdateCategory(category);
    if (category.id !== updatedId) {
      throw new Error("Error saving data!");
    } else {
      //succes
      result.values = category;
      revalidatePath("/categories");
    }
  } catch (err) {
    const error = ensureError(err);
    errors.general +=
      error?.message +
      (error instanceof CustomError && error.code ? ` (${error.code})` : "");
    logger.error(error);
    result = { success: false, errors: errors };
  }
  return result;
}

/** create new product */
export async function createProduct(
  _: State,
  formData: FormData
): Promise<State> {
  let result: State = { success: true };
  let errors: Record<string, string> = { general: "" };
  try {
    const validatedFields = ProductSchema.omit({ id: true }).safeParse(
      Object.fromEntries(formData)
    );
    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
      errors = getIssuesAsRecord(validatedFields.error.issues, true);
      throw new Error("Error validating data!");
    }

    // Prepare data for insertion into the database
    const { name, categoryId } = validatedFields.data;
    const id = await CreateProduct(name, categoryId);
    if (id === 0) {
      throw new Error("Error saving data!");
    } else {
      //succes
      result.values = { id: id, name: name, categoryId: categoryId };
      revalidatePath("/products");
    }
  } catch (err) {
    const error = ensureError(err);
    errors.general +=
      error?.message +
      (error instanceof CustomError && error.code ? ` (${error.code})` : "");
    logger.error(error);
    result = { success: false, errors: errors };
  }
  return result;
}

/** update product */
export async function updateProduct(
  _: State,
  formData: FormData
): Promise<State> {
  let result: State = { success: true };
  let errors: Record<string, string> = { general: "" };
  try {
    const validatedFields = ProductSchema.safeParse(
      Object.fromEntries(formData)
    );
    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
      errors = getIssuesAsRecord(validatedFields.error.issues, true);
      throw new Error("Error validating data!");
    }

    // Prepare data for updating the database
    const product: ProductRaw = validatedFields.data;
    const updatedId = await UpdateProduct(product);
    if (product.id !== updatedId) {
      throw new Error("Error saving data!");
    } else {
      //succes
      result.values = product;
      revalidatePath("/products");
    }
  } catch (err) {
    const error = ensureError(err);
    errors.general +=
      error?.message +
      (error instanceof CustomError && error.code ? ` (${error.code})` : "");
    logger.error(error);
    result = { success: false, errors: errors };
  }
  return result;
}
