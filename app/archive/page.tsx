import { Metadata } from 'next';
import { fetchArchives } from '../lib/data';
import Link from 'next/link';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { ShoppingList } from '../lib/definitions';
import Error from '@/app/error';

export const metadata: Metadata = {
  title: 'Archive'
};

export default async function Page()
{
  const data = await fetchArchives();

  if (data === null || data.success === false || data.values === undefined) {
    //we got an error
    const error = {
      name: 'Error',
      message: (data && data.errors?.general ? data.errors.general : 'Error')
    };
    return <Error error={ error } />
  } else {
    //we got data
    const list = data.values as ShoppingList[];
    return (
      <div>
        <h2 className="border-b">Archive</h2>
        <div className="border rounded-md overflow-auto mt-1">
          <table className="w-full text-gray-900 bg-gray-100">
            <thead className="text-left text-sm font-normal bg-gray-600 text-white">
              <tr>
                <th scope="col" className="px-2 py-1 w-4"></th>
                <th scope="col" className="px-2 py-1 w-24">Date</th>
                <th scope="col" className="px-2 py-1">Description</th>
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
                      <td className='px-2'>
                        <Link href={ './archive/' + r.id }>
                          <InformationCircleIcon className='w-4 text-blue-500' />
                        </Link>
                      </td>
                      <td className='px-2'>{ r.date }</td>
                      <td className='px-2'>{ r.text }</td>
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