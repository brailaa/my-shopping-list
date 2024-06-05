import { ViewShoppingRow } from "@/app/lib/definitions";
import clsx from "clsx";
import { ButtonEdit } from "../button-edit";
import { ButtonDelete } from "../button-delete";
import QuantityCell from "./quantity-cell";
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { useState } from "react";

interface idNoResponseAction
{
  (id: number): void;
}

export default function ShoppingListRowsTableGroup(
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
  const [hiddenRows, setHiddenRow] = useState<string[]>([]);
  //row creation
  const totalRows = rows.filter(r => !r.checked).length;
  const totalQuantity = rows.reduce((partial, r) => partial + (r.checked ? 0 : r.quantity), 0);
  let cat = '';
  let totalP = 0;
  let totalQ = 0;
  let rowHeader: JSX.Element | undefined = undefined;
  let rowFooter: JSX.Element | undefined = undefined;
  let viewRows: JSX.Element[] = [];
  rows.forEach(r =>
  {
    let hiddenCategory = hiddenRows.includes(r.categoryName);
    if (r.categoryName !== cat) {
      rowHeader = (
        <tr
          key={ `h${r.id}` } id={ `h.${r.categoryName}` }
          className="font-semibold bg-gray-200 w-full py-3"
        >
          <td>
            <ChevronRightIcon
              className={
                "w-4 cursor-pointer" +
                (hiddenCategory ? " rotate-90" : "")
              }
              onClick={ () => handleHeaderClick(r.categoryName) }
            />
          </td>
          <td colSpan={ 3 } className="pl-4">
            { r.categoryName }
          </td>
        </tr>
      );
      if (rowFooter) {
        viewRows.push(rowFooter);
      }
      viewRows.push(rowHeader);
      cat = r.categoryName;
      totalP = 0;
      totalQ = 0;
    }
    totalP += r.checked ? 0 : 1;
    totalQ += r.checked ? 0 : r.quantity;
    viewRows.push(
      <tr
        key={ r.id }
        className={ clsx(
          "w-full border-b py-3 text-sm",
          {
            'line-through': r.checked
          },
          {
            'hidden': hiddenCategory
          }
        ) }
        onClick={ () => onRowClick(r.id, !r.checked) }
      >
        <td className="text-right">{ r.index }</td>
        <td>{ r.productName }</td>
        <td>
          <QuantityCell
            id={ r.id }
            quantity={ r.quantity }
            noGoodQuantity={ r.savedQuantity }
            onQuantityChange={ onQuantityChange }
          />
        </td>
        <td className="flex flex-row gap-1 pl-1">
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
    );
    rowFooter = (
      <tr
        key={ `f${r.id}` } id={ `h.${r.categoryName}` }
        className="bg-gray-200 w-full text-sm"
      >
        <td colSpan={ 3 } className="pb-3 px-2">
          <b>To buy:</b> { totalP } products, { totalQ } items
        </td>
        <td></td>
      </tr>
    );
  });
  if (rowFooter) {
    viewRows.push(rowFooter);
  }

  function handleHeaderClick(category: string)
  {
    const index = hiddenRows.indexOf(category);
    let newHiddenRows: string[] = [];
    if (index > -1) {
      //found, so we remove it
      newHiddenRows = hiddenRows.filter(s => s !== category);
    } else {
      //not found, so we insert
      newHiddenRows = [...hiddenRows, category];
    }
    setHiddenRow(newHiddenRows);
  }

  return (
    <div className="border rounded-md overflow-auto mt-1">
      <table className="w-full text-gray-900 bg-gray-100">
        <thead className="text-left text-sm font-normal bg-gray-600 text-white">
          <tr key="header">
            <th scope="col" className="px-2 py-1 w-8 text-right">
              #
            </th>
            <th scope="col" className="px-2 py-1 max-w-52 min-w-40">
              Product
            </th>
            <th scope="col" className="px-2 py-1 w-24 text-right">
              Quantity
            </th>
            <th scope="col" className="px-2 py-1">
            </th>
          </tr>
        </thead>
        <tbody>
          { viewRows.map(r => r) }
        </tbody>
        <tfoot>
          <tr
            key="footer"
            className="text-left text-sm font-normal bg-gray-500 text-white"
          >
            <td colSpan={ 3 } className="px-2">
              <b>To buy:</b> { totalRows } products, { totalQuantity } items
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}