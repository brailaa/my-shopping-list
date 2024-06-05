import { Metadata } from 'next';
import Link from 'next/link';
import { CircleStackIcon } from '@heroicons/react/24/outline';
import Form from '@/app/ui/products/create-form';
import { fetchCategories } from '@/app/lib/data';
import Error from '@/app/error';
import { Category } from '@/app/lib/definitions';

export const metadata: Metadata = {
    title: 'Create Product'
};

export default async function Page()
{
    const data = await fetchCategories();

    if (data === null || data.success === false || data.values === undefined) {
        //we got an error
        const error = {
            name: 'Error',
            message: (data && data.errors?.general ? data.errors.general : 'Error')
        };
        return <Error error={ error } />
    } else {
        //we got data
        const categories = data.values as Category[];
        return (
            <div>
                <h2 className="border-b flex flex-row gap-1 mb-1">
                    <Link href="/products" className='text-blue-500 flex flex-row gap-1'>
                        <CircleStackIcon className='w-4' />
                        Products
                    </Link>
                    &gt; Create Product
                </h2>
                <Form categories={ categories } />
            </div>
        );
    }
}