'use client';

import { Category, Product } from "@/app/lib/definitions";
import Link from 'next/link';
import { ButtonAdd } from '@/app/ui/button-add';
import { ButtonEdit } from '@/app/ui/button-edit';
import { useState } from "react";

export default function ProductsManager({ categories, products }:
  { categories: Category[], products: Product[] })
{
  const [category, setCategory] = useState('0');
  const categoryId = parseInt(category);
  const filteredProducts = products.filter(p => categoryId === 0 || categoryId === p.category.id);
  const totalRows = filteredProducts.length;

  return (
    <div>
      <h2 className="border-b mb-1">Products</h2>
      <div className="flex flex-row items-center gap-4">
        <Link href='/products/create'>
          <ButtonAdd>New product</ButtonAdd>
        </Link>
        <select
          className="rounded-md border h-full"
          value={ category }
          onChange={ (e) => setCategory(e.target.value) }
        >
          <option value='0'>-- All products --</option>
          {
            categories.map(c =>
              <option
                key={ c.id }
                value={ c.id }
              >
                { c.name }
              </option>
            )
          }
        </select>
      </div>
      <div className="border rounded-md overflow-auto mt-1">
        <table className="w-full text-gray-900 bg-gray-100">
          <thead className="text-left text-sm font-normal bg-gray-600 text-white">
            <tr>
              <th scope="col" className='px-2 py-1 max-w-36'>Name</th>
              <th scope="col" className='px-2 py-1 max-w-36'>Category</th>
              <th scope="col" className='px-2 py-1'></th>
            </tr>
          </thead>
          <tbody>
            {
              filteredProducts.map(p =>
              {
                return (
                  <tr
                    key={ p.id }
                    className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                  >
                    <td className='px-2'>{ p.name }</td>
                    <td className='px-2'>{ p.category.name }</td>
                    <td className='pl-1'>
                      <Link href={ '/products/' + p.id }>
                        <ButtonEdit />
                      </Link>
                    </td>
                  </tr>
                )
              })
            }
          </tbody>
          <tfoot>
            <tr className="text-left text-sm font-normal bg-gray-500 text-white">
              <td colSpan={ 3 } className="px-2">
                { totalRows } products
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}