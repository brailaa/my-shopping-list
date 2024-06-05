import { Metadata } from 'next';
import { fetchCategories, fetchProduct } from '../../lib/data';
import { CircleStackIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Form from '@/app/ui/products/edit-form';
import Error from '@/app/error';
import { Category, ProductRaw } from '@/app/lib/definitions';

export const metadata: Metadata = {
  title: 'Edit Product'
};

export default async function Page({ params }: { params: { id: string } })
{
  const [dataProd, dataCat] = await Promise.all([
    fetchProduct(params.id),
    fetchCategories()
  ]);
  if (dataCat === null || dataCat.success === false || dataCat.values === undefined) {
    //we got an error
    const error = {
      name: 'Error',
      message: (dataCat && dataCat.errors?.general ? dataCat.errors.general : 'Error')
    };
    return <Error error={ error } />
  }
  if (dataProd === null || dataProd.success === false || dataProd.values === undefined) {
    //we got an error
    const error = {
      name: 'Error',
      message: (dataProd && dataProd.errors?.general ? dataProd.errors.general : 'Error')
    };
    return <Error error={ error } />
  }
  const categories = dataCat.values as Category[];
  const product = dataProd.values as ProductRaw;

  return (
    <div>
      <h2 className="border-b flex flex-row gap-1 mb-1">
        <Link href="/categories" className='text-blue-500 flex flex-row gap-1'>
          <CircleStackIcon className='w-4' />
          Product
        </Link>
        &gt; Edit Category: { product.name }
      </h2>
      <Form product={ product } categories={ categories } />
    </div>
  );
}
