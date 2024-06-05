import { Metadata } from 'next';
import { fetchCategory } from '@/app/lib/data';
import { RectangleStackIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Form from '@/app/ui/categories/edit-form';
import { Category, State } from '@/app/lib/definitions';
import Error from '@/app/error';

export const metadata: Metadata = {
  title: 'Edit Category'
};

export default async function Page({ params }: { params: { id: string } })
{
  const data = await fetchCategory(params.id);

  if (data === null || data.success === false || data.values === undefined) {
    //we got an error
    const error = {
      name: 'Error',
      message: (data && data.errors?.general ? data.errors.general : 'Error')
    };
    return <Error error={ error } />
  } else {
    //we got data
    const category = data.values as Category;
    return (
      <div>
        <h2 className="border-b flex flex-row gap-1 mb-1">
          <Link href="/categories" className='text-blue-500 flex flex-row gap-1 items-center'>
            <RectangleStackIcon className='w-4' />
            Categories
          </Link>
          &gt; Edit Category
        </h2>
        <Form category={ category } />
      </div>
    );
  }
}
