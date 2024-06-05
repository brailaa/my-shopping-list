'use client';

import { createCategory } from "@/app/lib/actions";
import { Category, State } from "@/app/lib/definitions";
import { useForm } from "@/app/lib/use-form-hook";
import { useRouter } from 'next/navigation';
import { useContext, useEffect } from "react";
import { ContextToaster } from "../toast";
import { Button } from "../button";
import { CancelButton } from "../button-cancel";

export default function Form()
{
  const { isPending, formState, formAction, onSubmit } = useForm<State>(createCategory, null);
  const toaster = useContext(ContextToaster);
  const router = useRouter();

  /** effect trigerred after tried to save */
  useEffect(() =>
  {
    if (typeof window !== undefined
      && formState
      && formState.success
      && formState.values !== undefined) {
      const newCat = formState.values as Category;
      toaster?.setTypeToaster({
        type: 'success',
        title: 'Create Category',
        message: `Category \"${newCat.name} was created.`,
        size: 'small',
        position: 'top-right',
        icon: true
      });
      router.prefetch('/categories');
      router.push('/categories');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState]);

  function onCancel(event: React.MouseEvent<HTMLElement>)
  {
    event.stopPropagation();
    toaster?.setTypeToaster({
      type: 'info',
      title: 'Create Category',
      message: `Creating new category was aborted.`,
      size: 'small',
      position: 'top-right',
      icon: true
    })
    router.push('/categories');
  }

  return (
    <form action={ formAction } onSubmit={ onSubmit }>
      <div className="rounded-md border bg-gray-50 p-4 md:p-6 max-w-96 mx-auto">
        {/* Name */ }
        <div className="mb-4">
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-600">
            Category name:
          </label>
          <div className="relative">
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Type name"
              required
              disabled={ isPending }
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
          <CancelButton aria-disabled={ isPending } onClick={ onCancel } />
          <Button type="submit" aria-disabled={ isPending }>Create Category</Button>
        </div>
      </div>
    </form>
  );
}