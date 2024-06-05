'use client';

import { createShoppingList } from "@/app/lib/actions";
import { ShoppingList, State } from "@/app/lib/definitions";
import { Button } from "../button";
import { useForm } from "@/app/lib/use-form-hook";
import { useEffect } from "react";

export default function CreateForm({ onSuccess }: { onSuccess: (l: ShoppingList) => void })
{
  const { isPending, formState, formAction, onSubmit } = useForm<State>(createShoppingList, null);

  /** effect trigerred after tried to save */
  useEffect(() =>
  {
    if (typeof window !== undefined
      && formState
      && formState.success
      && formState.values !== undefined) {
      onSuccess(formState.values);
    }
  }, [formState, onSuccess]);

  return (
    <form action={ formAction } onSubmit={ onSubmit }>
      <div className="rounded-md border bg-gray-50 p-4 md:p-6">
        {/* Date */ }
        <div className="mb-4">
          <label htmlFor="date" className="mb-2 block text-sm font-medium text-gray-600">
            Choose date:
          </label>
          <div className="relative">
            <input
              id="date"
              name="date"
              type="date"
              defaultValue={ new Date().toISOString().slice(0, 10) }
              placeholder="Choose data"
              required
              disabled={ isPending }
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500 text-gray-600"
            />
          </div>
        </div>
        {/* Text */ }
        <div className="mb-4">
          <label htmlFor="text" className="mb-2 block text-sm font-medium text-gray-600">
            Description:
          </label>
          <div className="relative">
            <textarea
              id="text"
              name="text"
              placeholder="Description"
              disabled={ isPending }
              rows={ 2 }
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500 text-gray-600 placeholder:italic"
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
          <Button type="submit" aria-disabled={ isPending }>Create Shopping List</Button>
        </div>
      </div>
    </form>
  )
}