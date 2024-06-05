import { ViewShoppingRow } from "@/app/lib/definitions";
import clsx from "clsx";
import { ButtonEdit } from "../button-edit";
import { ButtonDelete } from "../button-delete";
import QuantityCell from "./quantity-cell";

interface idNoResponseAction
{
  (id: number): void;
}

export default function ShoppingListRowsTable(
  {
    rows,
    isProcessingRows,
    onRowClick,
    onEditClick,
    onDeleteClick,
    onQuantityChange
  }:
    {
      rows: ViewShoppingRow[],
      isProcessingRows: boolean,
      onRowClick: (id: number, s: boolean) => void,
      onEditClick: idNoResponseAction,
      onDeleteClick: idNoResponseAction,
      onQuantityChange: (id: number, q: number) => void
    }
)
{
  const totalRows = rows.filter(r => !r.checked).length;
  const totalQuantity = rows.reduce((partial, r) => partial + (r.checked ? 0 : r.quantity), 0);

  return (
    <div className="border rounded-md overflow-auto mt-1">
      <table className="w-full text-gray-900 bg-gray-100">
        <thead className="text-left text-sm font-normal bg-gray-600 text-white">
          <tr key="header">
            <th scope="col" className="px-2 py-1 w-8 text-right">
              #
            </th>
            <th scope="col" className="px-2 py-1 max-w-52">
              Product
            </th>
            <th scope="col" className="px-2 py-1 max-w-52">
              Category
            </th>
            <th scope="col" className="px-2 py-1 w-24 text-right">
              Quantity
            </th>
            <th scope="col" className="px-2 py-1">
            </th>
          </tr>
        </thead>
        <tbody>
          {
            rows.map(r =>
              <tr
                key={ r.id }
                className={ clsx(
                  "w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg",
                  {
                    'line-through': r.checked
                  }
                ) }
                onClick={ () => onRowClick(r.id, !r.checked) }
              >
                <td className="text-right">{ r.index }</td>
                <td>{ r.productName }</td>
                <td>{ r.categoryName }</td>
                <td>
                  <QuantityCell
                    id={ r.id }
                    quantity={ r.quantity }
                    noGoodQuantity={ r.savedQuantity }
                    onQuantityChange={ onQuantityChange }
                  />
                </td>
                <td className="flex flex-row gap-1 pl-1 min-w">
                  <ButtonEdit
                    onClick={ (e) => { e.stopPropagation(); onEditClick(r.id); } }
                    disabled={ isProcessingRows }
                  />
                  <ButtonDelete
                    onClick={ (e) => { e.stopPropagation(); onDeleteClick(r.id); } }
                    disabled={ isProcessingRows }
                  />
                </td>
              </tr>
            ) }
        </tbody>
        <tfoot>
          <tr
            key="footer"
            className="text-left text-sm font-normal bg-gray-500 text-white"
          >
            <td colSpan={ 4 } className="px-2">
              <b>To buy:</b> { totalRows } products, { totalQuantity } items
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}