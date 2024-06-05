'use client';

import { updateProduct } from "@/app/lib/actions";
import { Category, ProductRaw, State } from "@/app/lib/definitions";
import { Button } from "../button";
import { useContext, useEffect } from "react";
import { useForm } from "@/app/lib/use-form-hook";
import { CancelButton } from "../button-cancel";
import { ContextToaster } from "../toast";
import { useRouter } from "next/navigation";

export default function Form({ product, categories }
  : { product: ProductRaw, categories: Category[] })
{
  const { isPending, formState, formAction, onSubmit } = useForm<State>(updateProduct, null);
  const toaster = useContext(ContextToaster);
  const router = useRouter();

  /** effect trigerred after tried to save */
  useEffect(() =>
  {
    if (typeof window !== undefined
      && formState
      && formState.success
      && formState.values !== undefined) {
      const newProd = formState.values as ProductRaw;
      toaster?.setTypeToaster({
        type: 'success',
        title: 'Update Product',
        message: `Product \"${newProd.name} was updated.`,
        size: 'small',
        position: 'top-right',
        icon: true
      });
      router.prefetch('/products');
      router.push('/products');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState]);

  function onCancel(event: React.MouseEvent<HTMLElement>)
  {
    event.stopPropagation();
    toaster?.setTypeToaster({
      type: 'info',
      title: 'Update Product',
      message: `Editing product was aborted.`,
      size: 'small',
      position: 'top-right',
      icon: true
    })
    router.push('/products');
  }

  return (
    <form action={ formAction } onSubmit={ onSubmit }>
      <div className="rounded-md border bg-gray-50 p-4 md:p-6 max-w-96 mx-auto">
        <input type="hidden" value={ product.id } name='id' />
        {/* Category */ }
        <div className="mb-4">
          <label htmlFor="categoryId" className="mb-2 block text-sm font-medium text-gray-600">
            Category:
          </label>
          <div className="relative">
            <select
              id="categoryId"
              name="categoryId"
              disabled={ isPending }
              defaultValue={ product.categoryId }
              required
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500 text-gray-600"
            >
              {
                categories.map(c =>
                  <option value={ c.id } key={ c.id }>{ c.name }</option>
                )
              }
            </select>
          </div>
        </div>
        {/* Name */ }
        <div className="mb-4">
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-600">
            Name:
          </label>
          <div className="relative">
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Type name"
              defaultValue={ product.name }
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
          <Button type="submit" aria-disabled={ isPending }>Save Product</Button>
        </div>
      </div>
    </form>
  )
}