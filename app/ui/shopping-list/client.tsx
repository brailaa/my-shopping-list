'use client';

import { Category, Product, RowAction, ShoppingList, ShoppingListRow, ShoppingListRowRaw, State, ViewShoppingRow } from "@/app/lib/definitions";
import { useCallback, useContext, useEffect, useState } from "react";
import CreateForm from "./create-form";
import { archiveShoppingList } from "@/app/lib/actions";
import { ButtonAdd } from "../button-add";
import { YesNoDialog } from "../dialog-yesno";
import ShoppingListData from "./list-data";
import ShoppingListRowsTable from "./view-normal";
import EditForm from "./edit-form";
import CreateRowForm from "./create-row-form";
import { CreateShoppingListRow, DeleteShoppingListRow, UpdateShoppingListRow, UpdateShoppingListRowQuantity } from "@/app/lib/data";
import EditRowForm from "./edit-row-form";
import { ButtonArchive } from "./button-archive";
import RadioGroup from "../radio-group";
import ShoppingListRowsTableGroup from "./view-group";
import { ContextToaster } from "../toast";
import { ensureError, getIssuesAsRecord, rowToRaw } from "@/app/lib/utils";
import { ShoppingListRowSchema } from "@/app/lib/schemas";

export default function ShoppingListClient(
  { initialList, initialRows, products, categories }
    : {
      initialList: ShoppingList,
      initialRows: ShoppingListRow[],
      products: Product[],
      categories: Category[]
    }
)
{
  /** the list */
  const [list, setList] = useState(initialList);
  /** the list rows */
  const [rows, setRows] = useState(initialRows);
  /** true when showing the edit list form */
  const [isEditingList, setIsEditingList] = useState(false);
  /** true when showing the create row form */
  const [isCreatingRow, setIsCreatingRow] = useState(false);
  /** true when showing the edit row form */
  const [isEditingRow, setIsEditingRow] = useState(false);
  /** the row to edit/delete */
  const [currentRow, setCurrentRow] = useState<ShoppingListRow | null>(null);
  /** the delete dialog state */
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  /** false = order by #, true = order by product name */
  const [orderByName, setOrderByName] = useState(false);
  /** true = group by category */
  const [groupByCategory, setGroupByCategory] = useState(false);
  /** the rows used for views */
  const [viewRows, setViewRows] = useState<ViewShoppingRow[]>([]);
  /** the index for a new row */
  const nextRowIndex = rows.reduce((count, r) => count > r.rowIndex ? count : r.rowIndex, 0) + 1;
  /** the toaster context for showing succes/error messages */
  const toaster = useContext(ContextToaster);
  /** rows actions queue, for processing interactive quantity/status updates */
  const [actionQueue, setActionQueue] = useState<{
    action: RowAction,
    success: string,
    error: string
  }[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const isProcessingRows = actionQueue.length > 0 || currentRow !== null;

  //effects for tracking states (only in dev mode!)
  /*
  useEffect(() => console.log('list'), [list]);
  useEffect(() => console.log('rows'), [rows]);
  useEffect(() => console.log('isEditingList'), [isEditingList]);
  useEffect(() => console.log('isCreatingRow'), [isCreatingRow]);
  useEffect(() => console.log('isEditingRow'), [isEditingRow]);
  useEffect(() => console.log('currentRow'), [currentRow]);
  useEffect(() => console.log('openDeleteDialog'), [openDeleteDialog]);
  useEffect(() => console.log('orderByName'), [orderByName]);
  useEffect(() => console.log('groupByCategory'), [groupByCategory]);
  useEffect(() =>
  {
    const result = 'viewRows ' + viewRows.reduce((s, r) => s + r.quantity + (r.checked ? '*' : '') + ', ', '');
    console.log(result);
  }, [viewRows]);
  */

  /** Initial generation of view rows */
  useEffect(() =>
  {
    generateViewRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Generation of view rows when order / grouping is changing */
  useEffect(() =>
  {
    generateViewRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderByName, groupByCategory]);

  /** redo the view rows when rows / order / grouping are changing */
  const generateViewRows = useCallback((newRows: ShoppingListRow[] = rows) =>
  {
    const newViewRows: ViewShoppingRow[] = [];
    newRows.map((r, i) => newViewRows.push({
      id: r.id,
      index: i + 1,
      categoryName: r.product.category.name,
      productName: r.product.name,
      quantity: r.quantity,
      checked: r.isChecked,
      savedQuantity: 0
    }));
    const compare = <T,>(x: T, y: T) => x < y ? -1 : (x === y ? 0 : 1);
    newViewRows.sort((a, b) =>
    {
      const group = groupByCategory ? compare(a.categoryName, b.categoryName) : 0;
      return group ||
        (orderByName ? compare(a.productName, b.productName) :
          (a.index < b.index ? -1 : 1));
    });
    setViewRows(newViewRows);
  }, [groupByCategory, orderByName, rows]);

  /** Called to set rows and view rows */
  const updateViewRows = useCallback((newRows: ShoppingListRow[]) =>
  {
    setRows(newRows);
    generateViewRows(newRows);
  }, [generateViewRows]);

  /** Saves a row after quantity or checking change */
  const saveRow = useCallback(async (
    action: RowAction,
    successMessage = 'Succes',
    errorMessage = 'Error saving'
  ) =>
  {
    const title = 'Update row';
    const oldRow = rows.find(r => r.id === action.id);
    if (oldRow) {
      const newRow: ShoppingListRow = {
        ...oldRow,
        quantity: action.type === 'quantity' ? action.quantity : oldRow.quantity,
        isChecked: action.type === 'check' ? action.checked : oldRow.isChecked
      };
      const result = await UpdateShoppingListRow(action);
      if (result && result.success) {
        const newRows = rows.map(r => r.id === newRow.id ? newRow : r);
        updateViewRows(newRows);
        toaster?.setTypeToaster({
          type: 'success',
          title: title,
          message: successMessage,
          size: 'small',
          position: 'top-right',
          icon: true
        });
      } else {
        if (action.type === 'quantity') {
          //undo the quantity
          const newViewRows: ViewShoppingRow[] = viewRows.map(r =>
            r.id === newRow.id
              ? { ...r, savedQuantity: action.quantity }
              : r
          );
          setViewRows(newViewRows);
        }
        toaster?.setTypeToaster({
          type: 'error',
          title: title,
          message: errorMessage +
            (result?.errors?.general ? ': ' + result.errors.general : ''),
          size: 'small',
          position: 'top-right',
          icon: true
        });
      }
    } else {
      toaster?.setTypeToaster({
        type: 'error',
        title: title,
        message: 'Error finding row!',
        size: 'small',
        position: 'top-right',
        icon: true
      });
    }
  }, [rows, toaster, updateViewRows, viewRows]);

  /** Rows actions handler.
   * It uses isBusy flag to serialize rows actions, one at a time.
   */
  const handleRowActions = useCallback(() =>
  {
    if (isBusy || actionQueue.length === 0) {
      return;
    }
    setIsBusy(true);
    const nextAction = actionQueue[0];
    saveRow(nextAction.action, nextAction.success, nextAction.error)
      .finally(() =>
      {
        setActionQueue(q => q.slice(1));
        setIsBusy(false);
      });
  }, [actionQueue, isBusy, saveRow]);

  /** Start action handling when queue is not empty */
  useEffect(() =>
  {
    if (actionQueue.length > 0 && !isBusy && currentRow === null) {
      setTimeout(() =>
      {
        handleRowActions();
      }, 100);
    }
  }, [actionQueue, currentRow, handleRowActions, isBusy]);

  /** Called at finishing editing the list */
  function handleCreateList(newList: ShoppingList)
  {
    setList(newList);
    setIsEditingList(false);
    toaster?.setTypeToaster({
      type: 'success',
      title: 'Create',
      message: 'A new shopping list was started',
      size: 'small',
      position: 'top-right',
      icon: true
    })
  }

  /** Handles the click on edit list button, it shows the edit list form. */
  function handleEditClick()
  {
    setIsEditingList(true);
  }

  /** Called when the list is successfully updated */
  function handleListUpdated(newList: ShoppingList)
  {
    setList(newList);
    setIsEditingList(false);
    console.log(toaster);
    toaster?.setTypeToaster({
      type: 'success',
      title: 'Update',
      message: 'The shopping list details were updated.',
      size: 'small',
      position: 'top-right',
      icon: true
    })
  }

  /** Called from table when changing tha quantity */
  const handleQuantityChange = useCallback((rowId: number, newQuantity: number) =>
  {
    setActionQueue([...actionQueue, {
      action: {
        id: rowId,
        type: 'quantity',
        quantity: newQuantity
      },
      success: 'Quantity updated.',
      error: 'Error updating quantity'
    }]);
  }, [actionQueue]);

  /** Called when cancelled editing the list */
  function handleCancelEditList()
  {
    setIsEditingList(false);
  }

  /** Handles the click on row, inverting the isChecked flag and saving the row to db. */
  const handleRowClick = useCallback((rowId: number, checked: boolean) =>
  {
    setActionQueue([...actionQueue, {
      action: {
        id: rowId,
        type: 'check',
        checked: checked
      },
      success: 'Status saved.',
      error: 'Error saving new status'
    }]);
  }, [actionQueue]);

  /** Called when click add row button */
  function handleAddRowClick()
  {
    setIsCreatingRow(true);
  }

  /** Called when clicking on the Create Row button on Create Row form
   * or on the Save Row button on Edit Row button. */
  async function handleTrySaveRow(_: State, formData: FormData): Promise<State>
  {
    try {
      const validatedFields = ShoppingListRowSchema
        .safeParse(Object.fromEntries(formData));
      // If form validation fails, return errors early. Otherwise, continue.
      if (!validatedFields.success) {
        const errors = getIssuesAsRecord(validatedFields.error.issues, true);
        throw new Error('general' in errors ? ` (${errors.general})` : '');
      }
      const currentValues = validatedFields.data;
      const prod = products.find(p => p.id == currentValues.product);
      if (!prod) {
        throw new Error('Invalid product!');
      }
      //check if we have another row with the selected product
      const existingRow = rows.find(r =>
        r.product.id === currentValues.product && r.id !== currentRow?.id
      );
      if (existingRow) {
        //we already have this product, so now we try to update quantity
        try {
          const updatedRow = { ...existingRow, quantity: existingRow.quantity + currentValues.quantity };
          const result = await UpdateShoppingListRowQuantity(
            updatedRow.id,
            updatedRow.quantity,
            currentRow?.id
          );
          if (!result || !result.success) {
            throw null;
          }
          //db updated, now update row list
          const newRows = rows.reduce((a, r) =>
          {
            if (r.id === updatedRow.id) {
              //the updated row
              a.push(updatedRow);
            } else if (r.id !== currentRow?.id) {
              //all the others rows are pushed in the new row array
              a.push(r);
            }
            return a;
          }, [] as ShoppingListRow[]);
          updateViewRows(newRows);
          toaster?.setTypeToaster({
            type: 'success',
            title: 'Update row',
            message: 'Existing row quantity was updated',
            size: 'small',
            position: 'top-right',
            icon: true
          })
        } catch (err) {
          return { success: false, errors: { general: 'Error updating quantity!' } };
        }
      } else {
        //not updating existing row, so insert a new row or update quantity
        const newRow = {
          id: currentRow?.id,
          list: list,
          product: prod,
          rowIndex: currentRow?.rowIndex ?? nextRowIndex,
          quantity: currentValues.quantity,
          isChecked: currentRow?.isChecked ?? false
        } as ShoppingListRow;
        if (isCreatingRow) {
          //add new row
          const result = await CreateShoppingListRow(newRow);
          if (!result || !result.success || typeof result.values !== 'number' || result.values < 1) {
            throw null;
          }
          newRow.id = result.values;
          updateViewRows([...rows, newRow]);
          toaster?.setTypeToaster({
            type: 'success',
            title: 'Create row',
            message: 'A new row was added',
            size: 'small',
            position: 'top-right',
            icon: true
          });
        } else {
          //save existing one
          const result = await UpdateShoppingListRow({
            type: 'row',
            id: newRow.id,
            product: newRow.product.id,
            quantity: newRow.quantity
          });
          if (!result || !result.success || result.values !== newRow.id) {
            throw null;
          }
          const newRows = rows.map(r => r.id === newRow.id ? newRow : r);
          updateViewRows(newRows);
          toaster?.setTypeToaster({
            type: 'success',
            title: 'Update row',
            message: 'The row was updated',
            size: 'small',
            position: 'top-right',
            icon: true
          })
        }
      }
    } catch (err) {
      const error = ensureError(err);
      return { success: false, errors: { general: 'Error validating data! ' + error?.message } };
    }
    setIsCreatingRow(false);
    setIsEditingRow(false);
    setCurrentRow(null);
    return { success: true };
  }

  /** Called when cancelled adding a row */
  function handleCancelAddRow()
  {
    setIsCreatingRow(false);
  }

  /** Handles the click on edit row button - it shows the edit row form. */
  function handleEditRowClick(rowId: number)
  {
    const row = rows.find(r => r.id == rowId);
    if (row) {
      setCurrentRow(row);
      setIsEditingRow(true);
    }
  }

  /** Called when cancelled editing a row */
  function handleCancelEditRow()
  {
    setCurrentRow(null);
    setIsEditingRow(false);
  }

  /** Handles the click on delete row button - it opens the yes no dialog. */
  function handleDeleteRowClick(rowId: number)
  {
    const row = rows.find(r => r.id == rowId);
    if (row) {
      setCurrentRow(row);
      setOpenDeleteDialog(true);
    }
  }

  /** Called when closing the delete yes no dialog.
   * @param response true = yes, false = no
   */
  async function handleDeleteDialogClose(response: boolean)
  {
    setOpenDeleteDialog(false);
    if (response && currentRow) {
      //delete row
      const result = await DeleteShoppingListRow(currentRow.id);
      if (result && result.success && result.values === currentRow.id) {
        //success
        const newRows = rows.filter(r => r.id !== currentRow.id);
        updateViewRows(newRows);
        toaster?.setTypeToaster({
          type: 'success',
          title: 'Delete row',
          message: 'The row was deleted',
          size: 'small',
          position: 'top-right',
          icon: true
        })
      } else {
        toaster?.setTypeToaster({
          type: 'error',
          title: 'Delete row',
          message: 'Error deleting row',
          size: 'small',
          position: 'top-right',
          icon: true
        })
      }
    }
    setCurrentRow(null);
  }

  /** Handles the archiving command */
  async function handleArchive()
  {
    const result = await archiveShoppingList();
    if (result?.success) {
      setList({ id: 0, date: '' });
      updateViewRows([]);
    } else {
      toaster?.setTypeToaster({
        type: 'error',
        title: 'Archive',
        message: result?.errors?.general || 'Error archiving',
        size: 'small',
        position: 'top-right',
        icon: true
      })
    }
  }

  return (
    <div>
      {/* yes no dialog for deleting rows */ }
      <YesNoDialog
        openModal={ openDeleteDialog && currentRow !== null }
        closeModal={ handleDeleteDialogClose }
      >
        <p className="text-red-600">
          Are you sure you want to remove &ldquo;{ currentRow?.product.name }&rdquo; from the list?
        </p>
      </YesNoDialog>
      {
        list && list.id !== 0 ?
          <div className="flex flex-col">
            {/* list exists */ }
            { isCreatingRow ?
              <>
                <h2 className="border-b">Add Shopping List Row</h2>
                <div className="justify-center items-center pt-2 min-w-80 max-w-sm mx-auto">
                  <CreateRowForm
                    products={ products }
                    categories={ categories }
                    onSave={ handleTrySaveRow }
                    onCancel={ handleCancelAddRow }
                  />
                </div>
              </>
              :
              isEditingRow && currentRow ?
                <>
                  <h2 className="border-b">Edit Shopping List Row</h2>
                  <div className="justify-center items-center pt-2 min-w-80 max-w-sm mx-auto">
                    <EditRowForm
                      row={ currentRow }
                      products={ products }
                      categories={ categories }
                      onSave={ handleTrySaveRow }
                      onCancel={ handleCancelEditRow }
                    />
                  </div>
                </>
                :
                <div>
                  <h2 className="border-b">Edit Shopping List</h2>
                  { isEditingList ?
                    <div className="justify-center items-center pt-2 min-w-80 max-w-sm mx-auto">
                      {/* edit the list state */ }
                      <EditForm
                        list={ list }
                        onSuccess={ handleListUpdated }
                        onCancel={ handleCancelEditList }
                      />
                    </div>
                    :
                    <>
                      {/* normal state */ }
                      {/* list data */ }
                      <div className="flex flex-col 2xs:flex-row items-start gap-1 my-1 border-b pb-1">
                        <ButtonArchive onClick={ handleArchive }>Archive</ButtonArchive>
                        <ShoppingListData list={ list } onEdit={ handleEditClick } />
                      </div>
                      <div>
                        <div className="flex flex-row items-center">
                          <ButtonAdd
                            onClick={ handleAddRowClick }
                            disabled={ isProcessingRows }
                          >
                            New row
                          </ButtonAdd>
                          {
                            isProcessingRows
                              ?
                              <div className="flex flex-row gap-1 items-center text-xs float-right pl-8">
                                <div
                                  className="w-5 h-5 p-0.5 bg-sky-500 loader"
                                ></div>
                                processing rows
                              </div>
                              : null

                          }
                        </div>
                        {/* list rows table */ }
                        {
                          groupByCategory
                            ? <ShoppingListRowsTableGroup
                              rows={ viewRows }
                              isProcessingRows={ isProcessingRows }
                              onRowClick={ handleRowClick }
                              onEditClick={ handleEditRowClick }
                              onDeleteClick={ handleDeleteRowClick }
                              onQuantityChange={ handleQuantityChange }
                            />
                            : <ShoppingListRowsTable
                              rows={ viewRows }
                              isProcessingRows={ isProcessingRows }
                              onRowClick={ handleRowClick }
                              onEditClick={ handleEditRowClick }
                              onDeleteClick={ handleDeleteRowClick }
                              onQuantityChange={ handleQuantityChange }
                            />
                        }
                        {/* order rows buttons */ }
                        <div className="mt-1 flex flex-row gap-8 align-center">
                          <RadioGroup
                            options={ [{ name: "#", value: "0" }, { name: "A", value: "1" }] }
                            value={ orderByName ? "1" : "0" }
                            onChange={ (v) => setOrderByName(v === "1") }
                          />
                          <div className="flex flex-row align-center gap-1">
                            <input
                              type="checkbox"
                              id="group"
                              checked={ groupByCategory }
                              onChange={ () => setGroupByCategory(!groupByCategory) }
                            />
                            <label htmlFor="group" className="text-sm">group by category</label>
                          </div>
                        </div>
                      </div>
                    </>
                  }
                </div>
            }
          </div>
          :
          <div className="justify-center items-center pt-2 min-w-80 max-w-sm place-self-center">
            {/* add new list mode */ }
            <h2 className="border-b mb-2">Start Shopping List</h2>
            <CreateForm onSuccess={ handleCreateList } />
          </div>
      }
    </div>
  );
}
