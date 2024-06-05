import { Metadata } from 'next';
import { fetchArchiveDetails } from '../../lib/data';
import { CheckIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Error from '@/app/error';
import { ShoppingList, ViewShoppingRow } from '@/app/lib/definitions';

export const metadata: Metadata = {
  title: 'Archive Details'
};

export default async function Page({ params }: { params: { id: string } })
{
  const data = await fetchArchiveDetails(params.id);

  if (data === null || data.success === false || data.values === undefined) {
    //we got an error
    const error = {
      name: 'Error',
      message: (data && data.errors?.general ? data.errors.general : 'Error')
    };
    return <Error error={ error } />
  } else {
    //we got data
    const [list, rows] = data.values as [ShoppingList, ViewShoppingRow[]];
    return (
      <div>
        <h2 className="border-b flex flex-row gap-1">
          <Link href="/archive" className='text-blue-500 flex flex-row gap-1'>
            <ArchiveBoxIcon className='w-4' />
            Archive
          </Link>
          &gt; Archive Details
        </h2>
        <div className="border-b">
          <p>{ list.date }</p>
          <p>{ list.text }</p>
        </div>
        <div className="border rounded-md overflow-auo mt-1">
          <table className="w-full text-gray-900 bg-gray-100">
            <thead className="text-left text-sm font-normal bg-gray-600 text-white">
              <tr>
                <th scope="col" className="px-2 py-1 w-24">Product</th>
                <th scope="col" className="px-2 py-1 w-24">Quantity</th>
                <th scope="col" className="px-2 py-1"></th>
              </tr>
            </thead>
            <tbody>
              {
                rows.map(r =>
                {
                  return (
                    <tr
                      key={ r.id }
                      className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                    >
                      <td className='px-2 w-24'>{ r.productName }</td>
                      <td className='px-2 w-24 text-right'>{ r.quantity }</td>
                      <td className='px-2'>
                        {
                          r.checked ? <CheckIcon className='w-4 text-green-500' /> : null
                        }
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}