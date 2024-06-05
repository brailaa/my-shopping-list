import { Metadata } from 'next';
import { fetchCategoriesPlus } from '../lib/data';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { ButtonAdd } from '../ui/button-add';
import { ButtonEdit } from '../ui/button-edit';
import { CategoryPlus, State } from '../lib/definitions';
import Error from '@/app/error';

export const metadata: Metadata = {
  title: 'Categories'
};

export default async function Page()
{
  const data = await fetchCategoriesPlus();

  if (data === null || data.success === false || data.values === undefined) {
    //we got an error
    const error = {
      name: 'Error',
      message: (data && data.errors?.general ? data.errors.general : 'Error')
    };
    return <Error error={ error } />
  } else {
    //we got data
    const list: CategoryPlus[] = data.values;
    const totalRows = list.length;
    const totalProducts = list.reduce((sum, c) => sum + c.products, 0);
    return (
      <div>
        <h2 className="border-b mb-1">Categories</h2>
        <Link href='/categories/create'>
          <ButtonAdd>New category</ButtonAdd>
        </Link>
        <div className="border rounded-md overflow-auto mt-1">
          <table className="w-full text-gray-900 bg-gray-100">
            <thead className="text-left text-sm font-normal bg-gray-600 text-white">
              <tr>
                <th scope="col" className="px-2 py-1 w-4"></th>
                <th scope="col" className="px-2 py-1 w-44">Name</th>
                <th scope="col" className="px-2 py-1 w-24"></th>
                <th scope="col" className="px-2 py-1"></th>
              </tr>
            </thead>
            <tbody>
              {
                list.map(r =>
                {
                  return (
                    <tr
                      key={ r.id }
                      className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                    >
                      <td className='px-2 w-4'>
                        <Link href={ './categories/' + r.id }>
                          <InformationCircleIcon className='w-5 text-blue-500' />
                        </Link>
                      </td>
                      <td className='px-2 max-w-44'>{ r.name }</td>
                      <td className='px-2 max-w-24'>
                        {
                          r.products > 0 ? <span>{ r.products } products</span> : <span>&nbsp;</span>
                        }
                      </td>
                      <td className='pl-2'>
                        <Link href={ '/categories/' + r.id + '/edit' }>
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
                <td colSpan={ 2 } className='px-2'>
                  { totalRows } categories
                </td>
                <td colSpan={ 2 } className='px-2'>
                  { totalProducts } products
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  }
}
