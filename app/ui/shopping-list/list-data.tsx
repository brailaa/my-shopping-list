import { ShoppingList } from "@/app/lib/definitions";
import { ButtonEdit } from "../button-edit";

/** Displays the shopping list data */
export default function ShoppingListData({ list, onEdit }:
  { list: ShoppingList, onEdit?: () => void })
{
  return (
    <>
      <ButtonEdit
        onClick={ (e) => { e.stopPropagation(); if (onEdit) onEdit(); } }
        disabled={ onEdit === undefined }
      >
        Edit
      </ButtonEdit>
      <h4 className="text-sm">
        { list.date } | { list.text }
      </h4>
    </>
  )
}