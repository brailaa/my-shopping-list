import { z } from "zod";

export const ShoppingListSchema = z.object({
  id: z.string().pipe(z.coerce.number().positive("Invalid list")),
  date: z.string().date("Please enter a valid date."),
  text: z.string().trim().max(250).optional(),
});

export const ShoppingListRowSchema = z.object({
  product: z.string().pipe(z.coerce.number().positive("Choose a product")),
  quantity: z
    .string()
    .pipe(z.coerce.number().positive("Quantity must be greater than 0")),
});

export const CategorySchema = z.object({
  id: z.string().pipe(z.coerce.number().positive("Invalid category")),
  name: z
    .string()
    .trim()
    .min(1, "Category name cannot be empty")
    .max(250, "Name too long"),
});

export const ProductSchema = z.object({
  id: z.string().pipe(z.coerce.number().positive("Invalid product")),
  name: z
    .string()
    .trim()
    .min(1, "Product name cannot be empty")
    .max(250, "Name too long"),
  categoryId: z.string().pipe(z.coerce.number().positive("Choose category")),
});
