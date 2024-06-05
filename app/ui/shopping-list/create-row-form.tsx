'use client';

import { Category, Product, ShoppingListRow, ShoppingListRowRaw, State } from "@/app/lib/definitions";
import { Button } from "../button";
import { useState } from "react";
import { useForm } from "@/app/lib/use-form-hook";
import { CancelButton } from "../button-cancel";

export default function CreateRowForm({ products, categories, onSave, onCancel }:
  {
    products: Product[],
    categories: Category[],
    onSave: (s: State, f: FormData) => Promise<State>,
    onCancel: () => void
  })
{
  const { isPending, formState, formAction, onSubmit } = useForm<State>(onSave, null);
  const [category, setCategory] = useState(0);
  const productsFiltered = category === 0 ? products :
    products.filter(p => p.category.id === category);

  return (
    <form action={ formAction } onSubmit={ onSubmit }>
      <div className="rounded-md border bg-gray-50 p-4 md:p-6">
        {/* Category */ }
        <div className="mb-4">
          <label htmlFor="category" className="mb-2 block text-sm font-medium text-gray-600">
            Category:
          </label>
          <div className="relative">
            <select
              id="category"
              value={ category }
              disabled={ isPending }
              onChange={ (e) => setCategory(Number.parseInt(e.target.value)) }
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500 text-gray-600"
            >
              <option value="0">-- All categories --</option>
              {
                categories.map(c =>
                  <option value={ c.id } key={ c.id }>{ c.name }</option>
                )
              }
            </select>
          </div>
        </div>
        {/* Product */ }
        <div className="mb-4">
          <label htmlFor="product" className="mb-2 block text-sm font-medium text-gray-600">
            Choose product:
          </label>
          <div className="relative">
            <select
              id="product"
              name="product"
              required
              disabled={ isPending }
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500 text-gray-600"
            >
              {
                productsFiltered.map(p =>
                  <option value={ p.id } key={ p.id }>{ p.name }</option>
                )
              }
            </select>
          </div>
        </div>
        {/* Quantity */ }
        <div className="mb-4">
          <label htmlFor="quantity" className="mb-2 block text-sm font-medium text-gray-600">
            Quantity:
          </label>
          <div className="relative">
            <input
              type="number"
              id="quantity"
              name="quantity"
              min={ 1 }
              max={ 255 }
              defaultValue={ 1 }
              required
              disabled={ isPending }
              className="text-right peer block w-full rounded-md border border-gray-200 py-2 px-2 text-sm outline-2 placeholder:text-gray-500 text-gray-600"
            />
          </div>
        </div>
        <div id="form-error" aria-live='polite' aria-atomic="true">
          { formState && !formState.success && formState.errors?.general &&
            <p className='mt-2 text-sm text-red-500'>
              { formState.errors.general }
            </p>
          }
        </div>
        <div className="mt-2 flex justify-end gap-4">
          <CancelButton aria-disabled={ isPending } onClick={ onCancel } />
          <Button type="submit" aria-disabled={ isPending }>Add Row</Button>
        </div>
      </div>
    </form>
  )
}