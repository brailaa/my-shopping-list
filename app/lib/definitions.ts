// This file contains type definitions for data.
// It describes the shape of the data, and what data type each property should accept.

/** Shopping List type */
export type ShoppingList = {
  id: number;
  date: string;
  text?: string;
};

/** Shopping List Row type (used internally) */
export type ShoppingListRow = {
  id: number;
  list: ShoppingList;
  product: Product;
  rowIndex: number;
  quantity: number;
  isChecked: boolean;
};

/** Shopping List Row type (used in db ops) */
export type ShoppingListRowRaw = {
  id: number;
  listid: number;
  product: number;
  index: number;
  quantity: number;
  checked: boolean;
};

/** Category type */
export type Category = {
  id: number;
  name: string;
};

/** Category+ type (Category + no. of products) */
export type CategoryPlus = Category & { products: number };

/** Product type (used internally) */
export type Product = {
  id: number;
  category: Category;
  name: string;
};

/** Product type (used in db ops) */
export type ProductRaw = {
  id: number;
  categoryId: number;
  name: string;
};

/** State type, used primarily for server-client comms */
export type State = {
  success: boolean;
  errors?: Record<string, string>; //general - default key
  values?: any; //used for sending data
} | null;

/** Shopping List Row type used in views */
export type ViewShoppingRow = {
  id: number;
  index: number;
  categoryName: string;
  productName: string;
  quantity: number;
  checked: boolean;
  savedQuantity: number; //quantity value after failed update of quantity
};

/** Actions upon shopping list rows, used for serializing actions and updating rows */
export type RowAction =
  | {
      type: "check";
      id: number;
      checked: boolean;
    }
  | {
      type: "quantity";
      id: number;
      quantity: number;
    }
  | {
      type: "row";
      id: number;
      product: number;
      quantity: number;
    };
