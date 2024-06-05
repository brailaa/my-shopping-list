import { Metadata } from 'next';
import { fetchCategoryDetails } from '../../lib/data';
import { InformationCircleIcon, RectangleStackIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Category, Product, State } from '@/app/lib/definitions';
import Error from '@/app/error';

export const metadata: Metadata = {
  title: 'Category Details'
};

export default async function Page({ params }: { params: { id: string } })
{
  const data = await fetchCategoryDetails(params.id);

  if (data === null || data.success === false || data.values === undefined) {
    //we got an error
    const error = {
      name: 'Error',
      message: (data && data.errors?.general ? data.errors.general : 'Error')
    };
    return <Error error={ error } />
  } else {
    //we got data
    const [category, products] = data.values as [Category, Product[]];
    return (
      <div>
        <h2 className="border-b flex flex-row gap-1">
          <Link href="/categories" className='text-blue-500 flex flex-row gap-1'>
            <RectangleStackIcon className='w-4' />
            Categories
          </Link>
          &gt; { category.name }
        </h2>
        <div className="border rounded-md overflow-auto mt-1">
          <table className="w-full text-gray-900 bg-gray-100">
            <thead className="text-left text-sm font-normal bg-gray-600 text-white">
              <tr>
                <th className='px-2 py-1 max-w-9'></th>
                <th className='px-2 py-1'>Products</th>
              </tr>
            </thead>
            <tbody>
              {
                products.map(p =>
                {
                  return (
                    <tr
                      key={ p.id }
                      className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                    >
                      <td className='px-2'>
                        <Link href={ '/products/' + p.id }>
                          <InformationCircleIcon className='w-5 text-blue-500' />
                        </Link>
                      </td>
                      <td className='px-2'>{ p.name }</td>
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